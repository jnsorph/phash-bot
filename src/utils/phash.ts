/**
 * Utilities for generating perceptual hashes (phash) from images and calculating hamming distance between hashes.
 * Author: Jonas Pape, 2026
 */

import sharp from 'sharp';

export async function generatePhash(url: string): Promise<string> {
	const res = await fetch(url);
	if (!res.ok) throw new Error('Failed to fetch image');

	const buffer = Buffer.from(await res.arrayBuffer());

	const raw = await sharp(buffer).resize(32, 32, { fit: 'fill' }).grayscale().raw().toBuffer();

	let sum = 0;
	for (const v of raw) sum += v;
	const avg = sum / raw.length;

	let hash = '';
	for (const v of raw) {
		hash += v > avg ? '1' : '0';
	}

	return hash;
}

export function hammingDistance(a: string, b: string): number {
	if (a.length !== b.length) return Infinity;
	let dist = 0;
	for (let i = 0; i < a.length; i++) {
		if (a[i] !== b[i]) dist++;
	}
	return dist;
}

export function formatHash(hash: string) {
	if (hash.length <= 96) {
		return hash;
	}

	return hash.slice(0, 48) + '…' + hash.slice(-48);
}
