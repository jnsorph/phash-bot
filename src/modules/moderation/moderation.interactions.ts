/**
 * Handles interactions for the moderation module, including opening the hash panel and blocking images via context menu.
 * Author: Jonas Pape, 2026
 */

import { ChatInputCommandInteraction, Interaction, MessageFlags } from 'discord.js';
import { handleBlockImageContextCommand } from '#@/modules/moderation/blockImage.handler';
import { handlePanelButtonInteraction } from '#@/modules/moderation/hashPanel.panel';
import { renderPanel } from '#@/modules/moderation/hashPanel.panel';

async function handleOpenPanelCommand(interaction: ChatInputCommandInteraction) {
	const panel = await renderPanel(0);

	await interaction.reply({
		embeds: [panel.embed],
		components: panel.components,
		flags: MessageFlags.Ephemeral
	});
}

export async function handleModerationInteraction(interaction: Interaction) {
	if (interaction.isButton()) {
		await handlePanelButtonInteraction(interaction);
		return;
	}

	if (interaction.isChatInputCommand() && interaction.commandName === 'hashpanel') {
		await handleOpenPanelCommand(interaction);
		return;
	}

	if (interaction.isMessageContextMenuCommand() && interaction.commandName === 'Bild blockieren') {
		await handleBlockImageContextCommand(interaction);
	}
}
