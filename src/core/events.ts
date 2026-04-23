import { Client } from "discord.js";
import { handleMessage } from "../modules/moderation/messageHandler.js";
import { handleReaction } from "../modules/moderation/reactionHandler.js";
import { handlePanelInteraction } from "../modules/moderation/hashPanel.js";

export function registerEvents(client: Client) {
	client.on('messageCreate', handleMessage);
	client.on('messageReactionAdd', handleReaction);
	client.on('interactionCreate', handlePanelInteraction);
}