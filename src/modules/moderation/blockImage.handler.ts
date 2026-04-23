/**
 * Handles the "Block Image" context menu command for messages. Allows to block images by their perceptual hash and store them in the database.
 * Author: Jonas Pape, 2026
 */

import {
	Attachment,
	MessageContextMenuCommandInteraction,
	MessageFlags,
	EmbedBuilder,
	Colors,
	ColorResolvable
} from 'discord.js';
import { generatePhash } from '#@/utils/phash';
import { logger } from '#@/infrastructure/logger';
import { HashRepository } from '#@/modules/moderation/hash.repository';

const repo = new HashRepository();

type BlockImageResult = {
	processed: number;
	skipped: number;
	errors: number;
};

function isImageAttachment(attachment: Attachment) {
	if (attachment.contentType?.startsWith('image/')) {
		return true;
	}

	return /\.(png|jpe?g|webp|gif|bmp)$/i.test(attachment.url);
}

export async function handleBlockImageContextCommand(
	interaction: MessageContextMenuCommandInteraction
) {
	if (interaction.commandName !== 'Bild blockieren') return;

	await interaction.deferReply({ flags: MessageFlags.Ephemeral });

	const imageAttachments = [...interaction.targetMessage.attachments.values()].filter(
		isImageAttachment
	);

	if (imageAttachments.length === 0) {
		await interaction.editReply({
			content: '❌ Die Nachricht enthält kein Bild, welches blockiert werden kann'
		});
		return;
	}

	const result: BlockImageResult = { processed: 0, skipped: 0, errors: 0 };

	for (const attachment of imageAttachments) {
		if (!attachment.url) {
			result.skipped += 1;
			continue;
		}

		try {
			const hash = await generatePhash(attachment.url);
			await repo.add(hash, attachment.url);
			result.processed += 1;
		} catch (error) {
			result.errors += 1;
			logger.error('Failed to process context command image:', error);
		}
	}

	const title = result.processed > 0 ? '✅ Bild erfolgreich blockiert' : '❌ Kein Bild blockiert';
	const color: ColorResolvable = result.processed > 0 ? Colors.Green : Colors.Red;

	await interaction.editReply({
		embeds: [
			new EmbedBuilder()
				.setTitle(title)
				.setColor(color)
				.addFields(
					{ name: 'Gespeichert', value: result.processed.toString(), inline: true },
					{ name: 'Übersprungen', value: result.skipped.toString(), inline: true },
					{ name: 'Fehler', value: result.errors.toString(), inline: true }
				)
				.setTimestamp()
		]
	});
}
