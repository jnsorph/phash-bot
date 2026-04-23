import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonInteraction,
	ButtonStyle,
	EmbedBuilder,
	GuildMember,
	Interaction,
	Message,
	PermissionsBitField
} from "discord.js";
import { HashRepository, type ScamHashEntry } from "./hash.repository.js";

const repo = new HashRepository();
const COMMANDS = ["!hashpanel", "!hashes"];
const PANEL_PREFIX = "phash-hashpanel";
const HASHES_PER_PAGE = 1;

type PanelState = {
	entries: ScamHashEntry[];
	totalPages: number;
	page: number;
};

type PanelRender = {
	embed: EmbedBuilder;
	components: ActionRowBuilder<ButtonBuilder>[];
	page: number;
};

function isAdmin(member: GuildMember | null | undefined) {
	return member?.permissions.has(PermissionsBitField.Flags.Administrator) ?? false;
}

function getPageFromContent(content: string): number {
	const parts = content.trim().split(/\s+/);
	if (parts.length < 2) return 0;

	const parsed = Number(parts[1]);
	return Number.isInteger(parsed) && parsed > 0 ? parsed - 1 : 0;
}

async function loadPanelState(page = 0): Promise<PanelState> {
	const entries = (await repo.getAllEntries()).sort((left, right) => left.hash.localeCompare(right.hash));
	const totalPages = Math.max(1, Math.ceil(entries.length / HASHES_PER_PAGE));
	const safePage = Math.min(Math.max(page, 0), totalPages - 1);

	return {
		entries,
		totalPages,
		page: safePage
	};
}

function formatHash(hash: string) {
	if (hash.length <= 96) {
		return hash;
	}

	return `${hash.slice(0, 48)}…${hash.slice(-48)}`;
}

function buildComponents(state: PanelState) {
	const navRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
		new ButtonBuilder()
			.setCustomId(`${PANEL_PREFIX}:prev:${state.page}`)
			.setLabel("Zurück")
			.setStyle(ButtonStyle.Secondary)
			.setDisabled(state.page === 0),
		new ButtonBuilder()
			.setCustomId(`${PANEL_PREFIX}:next:${state.page}`)
			.setLabel("Weiter")
			.setStyle(ButtonStyle.Secondary)
			.setDisabled(state.page >= state.totalPages - 1),
		new ButtonBuilder()
				.setCustomId(`${PANEL_PREFIX}:remove:${state.page}`)
				.setLabel("Entfernen")
				.setStyle(ButtonStyle.Danger)
				.setDisabled(state.entries.length === 0)
	);

	const rows = [navRow];

	return rows;
}

async function renderPanel(page = 0) {
	const state = await loadPanelState(page);
	const currentEntry = state.entries[state.page];
	return {
		embed: currentEntry
			? buildEntryEmbed(currentEntry, state.page, state.page, state.totalPages)
			: new EmbedBuilder()
				.setTitle("Gesperrte Hashes")
				.setColor(0xffb000)
				.setDescription("Es sind aktuell keine Hashes gesperrt."),
		components: buildComponents(state),
		page: state.page
	};
}

async function canManagePanel(message: Message) {
	if (!message.guild) return false;

	const member = message.member ?? await message.guild.members.fetch(message.author.id);
	return isAdmin(member);
}

export async function openHashPanelCommand(message: Message): Promise<boolean> {
	const content = message.content.trim();
	const commandName = content.split(/\s+/)[0]?.toLowerCase();
	const command = COMMANDS.find(entry => entry === commandName);

	if (!command) return false;
	if (!(await canManagePanel(message))) {
		await message.reply({ content: "Du brauchst Administratorrechte, um das Panel zu öffnen." });
		return true;
	}

	const page = getPageFromContent(content);
	const panel = await renderPanel(page);

	await message.reply({
		embeds: [panel.embed],
		components: panel.components
	});

	return true;
}

async function replyNoAccess(interaction: ButtonInteraction) {
	if (interaction.replied || interaction.deferred) return;

	await interaction.reply({
		content: "Du brauchst Administratorrechte, um das Panel zu verwenden.",
		ephemeral: true
	});
}

async function updatePanel(interaction: ButtonInteraction, page: number) {
	const panel = await renderPanel(page);

	await interaction.update({
		embeds: [panel.embed],
		components: panel.components
	});
}

function buildEntryEmbed(entry: ScamHashEntry, index: number, page: number, totalPages: number) {
	const embed = new EmbedBuilder()
		.setTitle(`Eintrag ${index + 1} / ${totalPages}`)
		.setColor('Random')
		.setDescription([
			`Hash: ${formatHash(entry.hash)}`,
			`Link: ${entry.url}`
		].join("\n"));

	if (entry.url) {
		embed.setImage(entry.url);
	}

	return embed;
}

export async function handlePanelInteraction(interaction: Interaction) {
	if (!interaction.isButton()) return;
	if (!interaction.customId.startsWith(PANEL_PREFIX)) return;

	if (!interaction.inGuild()) {
		await replyNoAccess(interaction);
		return;
	}

	if (!interaction.memberPermissions?.has(PermissionsBitField.Flags.Administrator)) {
		await replyNoAccess(interaction);
		return;
	}

	const [, action, pageValue] = interaction.customId.split(":");
	const page = Number(pageValue ?? 0);

	if (action === "refresh") {
		await updatePanel(interaction, page);
		return;
	}

	if (action === "prev") {
		await updatePanel(interaction, Math.max(page - 1, 0));
		return;
	}

	if (action === "next") {
		await updatePanel(interaction, page + 1);
		return;
	}

	if (action === "remove") {
		const state = await loadPanelState(page);
		const entry = state.entries[state.page];

		if (!entry) {
			await updatePanel(interaction, page);
			return;
		}

		await repo.remove(entry.hash);
		const updated = await renderPanel(page);

		await interaction.update({
			embeds: [updated.embed],
			components: updated.components
		});
	}
}