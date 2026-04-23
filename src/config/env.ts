import dotenv from 'dotenv';
dotenv.config();

export const env = {
	DISCORD_TOKEN: process.env.DISCORD_TOKEN!,
	PHASH_TRESHOLD: Number(process.env.PHASH_TRESHOLD || 10),
	REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
};