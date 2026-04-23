/**
 * Centralized environment variable management with type safety and default values.
 * Author: Jonas Pape, 2026
 */

import dotenv from 'dotenv';
dotenv.config();

export const env = {
	DISCORD_TOKEN: process.env.DISCORD_TOKEN!,
	ALERT_CHANNEL_ID: process.env.ALERT_CHANNEL_ID,
	PHASH_TRESHOLD: Number(process.env.PHASH_TRESHOLD || 10),
	REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379'
};
