/**
 * Tarot AI Configuration
 * 
 * Single source of truth for shared constants
 */

/** Maximum AI readings per day per user */
export const DAILY_LIMIT = 3;

/** Redis key prefix for rate limiting */
export const RATE_LIMIT_KEY_PREFIX = 'tarot-ai';

/** Duration of rate limit window in seconds (1 day) */
export const DAY_IN_SECONDS = 24 * 60 * 60;
