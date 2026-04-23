import { Message } from "discord.js";
import { generatePhash } from "../../utils/phash.js";
import { ScamDetectionService } from "./scamDetection.service.js";
import { HashRepository } from "./hash.repository.js";
import { logger } from "../../infrastructure/logger.js";
import { openHashPanelCommand } from "./hashPanel.js";

const service = new ScamDetectionService(new HashRepository());

export async function handleMessage(message: Message) {
	if (message.author.bot) return;

	if (await openHashPanelCommand(message)) {
		return;
	}

	for (const attachment of message.attachments.values()) {
		if (!attachment.contentType?.startsWith('image/')) continue;

		try {
			const hash = await generatePhash(attachment.url);

			if (await service.isScam(hash)) {
				await message.delete();
				logger.warn(`Deleted message from ${message.author.tag} containing a scam image.`);
				return;
			}
		} catch (error) {
			logger.error(`Failed to process attachment from ${message.author.tag}:`, error);
		}
	}
}