/**
 * Centralized event registration for the bot. All event handlers are registered here.
 * Author: Jonas Pape, 2026
 */

import { Client } from 'discord.js';
import { handleMessage } from '#@/modules/moderation/messageHandler';
import { handleModerationInteraction } from '#@/modules/moderation/moderation.interactions';

export function registerEvents(client: Client) {
	client.on('messageCreate', handleMessage);
	client.on('interactionCreate', handleModerationInteraction);
}
