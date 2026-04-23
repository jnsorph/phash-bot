/**
 * Bot initialization and event and command registration.
 * Author: Jonas Pape, 2026
 */

import { Client, GatewayIntentBits, Partials } from 'discord.js';
import { registerEvents } from '#@/core/events';
import { env } from '#@/config/env';
import { logger } from '#@/infrastructure/logger';
import { registerModerationCommands } from '#@/modules/moderation/moderation.commands';

export function createBot() {
	const client = new Client({
		intents: [
			GatewayIntentBits.Guilds,
			GatewayIntentBits.GuildMessages,
			GatewayIntentBits.MessageContent,
			GatewayIntentBits.GuildMembers
		],
		partials: [Partials.Message, Partials.Channel]
	});

	client.once('clientReady', () => {
		logger.success('Logged in as', client.user?.tag);
		logger.info('Registering commands...');
		registerModerationCommands(client).catch((error) => {
			logger.error('Failed to register commands:', error);
		});
	});

	registerEvents(client);

	client.login(env.DISCORD_TOKEN);
}
