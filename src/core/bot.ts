import { Client, GatewayIntentBits, Partials } from "discord.js";
import { registerEvents } from "./events.js";
import { env } from "../config/env.js";
import { logger } from "../infrastructure/logger.js";

export function createBot() {
	const client = new Client({
		intents: [
			GatewayIntentBits.Guilds,
			GatewayIntentBits.GuildMessages,
			GatewayIntentBits.MessageContent,
			GatewayIntentBits.GuildMembers,
			GatewayIntentBits.GuildMessageReactions
		],
		partials: [
			Partials.Message,
			Partials.Channel,
			Partials.Reaction,
			Partials.User
		]
	});

	client.once('ready', () => {
		logger.info('Logged in as', client.user?.tag);
	});

	registerEvents(client);

	client.login(env.DISCORD_TOKEN);
}