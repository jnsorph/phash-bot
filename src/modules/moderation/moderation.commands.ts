/**
 * Registers the commands.
 * Author: Jonas Pape, 2026
 */

import {
	ApplicationCommandType,
	Client,
	ContextMenuCommandBuilder,
	PermissionsBitField,
	SlashCommandBuilder
} from 'discord.js';
import { logger } from '#@/infrastructure/logger';

export async function registerModerationCommands(client: Client) {
	if (!client.application) return;

	const commands = [
		new SlashCommandBuilder()
			.setName('hashpanel')
			.setDescription('Öffnet das Panel zur Verwaltung blockierter Bilder')
			.setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
			.toJSON(),
		new ContextMenuCommandBuilder()
			.setName('Bild blockieren')
			.setType(ApplicationCommandType.Message)
			.setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
			.toJSON()
	];

	await client.application.commands.set(commands);
	logger.info('Registered global moderation commands.');
}
