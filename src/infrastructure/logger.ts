/**
 * Simple logger utility for consistent logging throughout the application.
 * Author: Jonas Pape, 2026
 */

export const logger = {
	info: (...args: any[]) => console.log('[INFO]', ...args),
	warn: (...args: any[]) => console.warn('[WARN]', ...args),
	error: (...args: any[]) => console.error('[ERROR]', ...args),
	success: (...args: any[]) => console.log('[SUCCESS]', ...args)
};
