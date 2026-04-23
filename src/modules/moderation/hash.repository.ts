/**
 * Repository for managing scam hashes in Redis.
 * Author: Jonas Pape, 2026
 */

import { redis } from '#@/infrastructure/redis';

const KEY = 'scam_hashes';

export type ScamHashEntry = {
	hash: string;
	url: string;
};

export class HashRepository {
	async add(hash: string, url: string): Promise<void> {
		await redis.hset(KEY, hash, url);
	}

	async remove(hash: string): Promise<void> {
		await redis.hdel(KEY, hash);
	}

	async getAll(): Promise<string[]> {
		const entries = await this.getAllEntries();
		return entries.map((entry) => entry.hash);
	}

	async getAllEntries(): Promise<ScamHashEntry[]> {
		const entries = await redis.hgetall(KEY);
		return Object.entries(entries).map(([hash, url]) => ({ hash, url: String(url ?? '') }));
	}
}
