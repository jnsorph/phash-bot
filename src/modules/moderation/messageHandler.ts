/**
 * Handler for incoming messages to detect and remove scam images based on perceptual hashes.
 * Author: Jonas Pape, 2026
 */

import { Colors, EmbedBuilder, Message, TextChannel } from 'discord.js';
import { generatePhash } from '#@/utils/phash';
import { ScamDetectionService } from '#@/modules/moderation/scamDetection.service';
import { HashRepository } from '#@/modules/moderation/hash.repository';
import { logger } from '#@/infrastructure/logger';
import { env } from '#@/config/env';

const service = new ScamDetectionService(new HashRepository());

export async function handleMessage(message: Message) {
	if (message.author.bot) return;

	for (const attachment of message.attachments.values()) {
		if (!attachment.contentType?.startsWith('image/')) continue;

		try {
			const hash = await generatePhash(attachment.url);

			if (await service.isScam(hash)) {
				await message.delete();
				logger.warn('Deleted message from', message.author.tag, 'containing a scam image.');
				const channelId = env.ALERT_CHANNEL_ID;

				if (channelId) {
					const channel: TextChannel | null = (await message.guild?.channels
						.fetch(channelId)
						.catch(() => null)) as TextChannel | null;

					if (channel) {
						await channel.send({
							embeds: [
								new EmbedBuilder()
									.setTitle('Scam Bild erkannt und gelöscht')
									.setDescription(
										'Ein Bild von ' +
											message.author.tag +
											' wurde gelöscht, da es ein bekanntes Scam-Bild enthielt.\n\n**Bild URL:** ' +
											attachment.url
									)
									.setColor(Colors.Red)
									.setImage(attachment.url)
							]
						});
					}
				}
				return;
			}
		} catch (error) {
			logger.error('Failed to process attachment from', message.author.tag, ':', error);
		}
	}
}
