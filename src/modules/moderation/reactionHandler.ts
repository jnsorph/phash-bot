import { MessageReaction, User, PermissionsBitField, PartialMessageReaction, PartialUser } from "discord.js";
import { generatePhash } from "../../utils/phash.js";
import { HashRepository } from "./hash.repository.js";
import { logger } from "../../infrastructure/logger.js";

const repo = new HashRepository();

export async function handleReaction(reaction: MessageReaction | PartialMessageReaction, user: User | PartialUser) {
	if (reaction.partial) {
		try {
			await reaction.fetch();
		} catch (error) {
			return;
		}
	}

	if (user.partial) {
		try {
			await user.fetch();
		} catch (error) {
			return;
		}
	}
	
	if (user.bot) return;

	const message = reaction.message;
	if (!message.guild) return;

	const member = await message.guild.members.fetch(user.id);

	if (!member.permissions.has(PermissionsBitField.Flags.Administrator)) return;

	if (reaction.emoji.name !== '🛑') return;

	for (const attachment of message.attachments.values()) {
		if (!attachment.contentType?.startsWith('image/')) continue;

		try {
			const hash = await generatePhash(attachment.url);
			await repo.add(hash, attachment.url);

			logger.info('Added new scam hash from reaction by', user.tag);

			await message.reply({
				content: 'Bild als Scam markiert und Hash gespeichert.',
			});
		} catch (error) {
			logger.error(error);
		}
	}
}