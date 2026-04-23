import { HashRepository } from "./hash.repository.js";
import { hammingDistance } from "../../utils/phash.js";
import { env } from "../../config/env.js";

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