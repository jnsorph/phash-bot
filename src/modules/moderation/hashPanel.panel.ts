/**
 * Hash Panel for managing blocked image hashes.
 * Author: Jonas Pape, 2026
 */

import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonInteraction,
	ButtonStyle,
	Colors,
	EmbedBuilder
} from 'discord.js';
import { HashRepository } from '#@/modules/moderation/hash.repository';
import { formatHash } from '#@/utils/phash';

const repo = new HashRepository();

export type PanelState = {
	entries: Array<{
		hash: string;
		url: string;
	}>;
	totalPages: number;
	page: number;
};

async function loadPanelState(
	page = 0
): Promise<{ entries: Array<{ hash: string; url: string }>; totalPages: number; page: number }> {
	const entries = (await repo.getAllEntries()).sort(
		(left: { hash: string }, right: { hash: string }) => left.hash.localeCompare(right.hash)
	);
	const totalPages = Math.max(1, Math.ceil(entries.length / 1));
	const safePage = Math.min(Math.max(page, 0), totalPages - 1);

	return {
		entries,
		totalPages,
		page: safePage
	};
}

function buildComponents(state: {
	entries: Array<{ hash: string; url: string }>;
	totalPages: number;
	page: number;
}) {
	const navRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
		new ButtonBuilder()
			.setCustomId('phash-hashpanel:prev:' + state.page.toString())
			.setLabel('Zurück')
			.setStyle(ButtonStyle.Secondary)
			.setDisabled(state.page === 0),
		new ButtonBuilder()
			.setCustomId('phash-hashpanel:next:' + state.page.toString())
			.setLabel('Weiter')
			.setStyle(ButtonStyle.Secondary)
			.setDisabled(state.page >= state.totalPages - 1),
		new ButtonBuilder()
			.setCustomId('phash-hashpanel:remove:' + state.page.toString())
			.setLabel('Entfernen')
			.setStyle(ButtonStyle.Danger)
			.setDisabled(state.entries.length === 0)
	);

	return [navRow];
}

export async function renderPanel(page = 0) {
	const state = await loadPanelState(page);
	const currentEntry = state.entries[state.page];

	return {
		embed: currentEntry
			? buildEntryEmbed(currentEntry, state.page, state.totalPages)
			: buildPanelEmptyEmbed(),
		components: buildComponents(state),
		page: state.page
	};
}

async function updatePanel(interaction: ButtonInteraction, page: number) {
	const panel = await renderPanel(page);

	await interaction.update({
		embeds: [panel.embed],
		components: panel.components
	});
}

export async function handlePanelButtonInteraction(interaction: ButtonInteraction) {
	if (!interaction.customId.startsWith('phash-hashpanel')) return;
	const [, action, pageValue] = interaction.customId.split(':');
	const page = Number(pageValue ?? 0);

	if (action === 'prev') {
		await updatePanel(interaction, Math.max(page - 1, 0));
		return;
	}

	if (action === 'next') {
		await updatePanel(interaction, page + 1);
		return;
	}

	if (action !== 'remove') {
		return;
	}

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

function buildEntryEmbed(entry: PanelState['entries'][number], page: number, totalPages: number) {
	const hashPreview = formatHash(entry.hash);

	const embed = new EmbedBuilder()
		.setTitle('Blockierte Bilder')
		.setColor(Colors.DarkAqua)
		.setDescription('Seite ' + (page + 1).toString() + ' von ' + totalPages.toString())
		.addFields(
			{ name: 'Hash', value: '`' + hashPreview + '`' },
			{ name: 'Quelle', value: entry.url || 'nicht hinterlegt' }
		);

	if (entry.url) {
		embed.setImage(entry.url);
	}

	return embed;
}

function buildPanelEmptyEmbed() {
	return new EmbedBuilder()
		.setTitle('Blockierte Bilder')
		.setColor(Colors.Red)
		.setDescription('Aktuell werden keine Bilder blockiert.');
}
