/**
 * Checks given image hashes against known scam hashes and decides if an image is a scam.
 * Author: Jonas Pape, 2026
 */

import { HashRepository } from '#@/modules/moderation/hash.repository';
import { hammingDistance } from '#@/utils/phash';
import { env } from '#@/config/env';

export class ScamDetectionService {
	constructor(private repo: HashRepository) {}

	async isScam(hash: string): Promise<boolean> {
		const hashed = await this.repo.getAll();

		for (const known of hashed) {
			if (hammingDistance(hash, known) <= env.PHASH_TRESHOLD) {
				return true;
			}
		}

		return false;
	}
}
