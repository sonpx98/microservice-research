/**
 * Crawler Configuration
 * 
 * Centralized configuration for crawler behavior
 */

/**
 * Number of articles to crawl per website
 * Optimized for Render free plan (15-minute window)
 * Default: 50 (can be adjusted between 20-50 based on needs)
 */
export const ARTICLES_PER_CRAWLER = 50;

/**
 * Batch size for adding jobs to Redis queue
 * Default: 10 (jobs per batch)
 * 
 * This helps prevent overwhelming the Redis queue by
 * adding jobs in smaller batches with slight delays
 */
export const BATCH_SIZE = 10;

/**
 * Delay between batches in milliseconds
 * Default: 100ms
 */
export const BATCH_DELAY_MS = 100;
