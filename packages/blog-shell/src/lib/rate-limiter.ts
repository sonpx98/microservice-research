/**
 * Rate Limiter Utility
 * 
 * Prevents excessive API calls by limiting the rate of requests.
 * Uses a token bucket algorithm.
 */

interface RateLimiterConfig {
    maxRequests: number;  // Maximum requests allowed in the time window
    windowMs: number;     // Time window in milliseconds
}

interface RateLimiterState {
    tokens: number;
    lastRefill: number;
}

const limiters = new Map<string, RateLimiterState>();

/**
 * Check if a request is allowed under the rate limit
 * @param key - Unique identifier for the rate limit bucket
 * @param config - Rate limiter configuration
 * @returns true if request is allowed, false if rate limited
 */
export function isRateLimited(
    key: string,
    { maxRequests, windowMs }: RateLimiterConfig
): boolean {
    const now = Date.now();
    let state = limiters.get(key);

    if (!state) {
        state = { tokens: maxRequests, lastRefill: now };
        limiters.set(key, state);
    }

    // Calculate tokens to add since last refill
    const timePassed = now - state.lastRefill;
    const tokensToAdd = Math.floor((timePassed / windowMs) * maxRequests);

    if (tokensToAdd > 0) {
        state.tokens = Math.min(maxRequests, state.tokens + tokensToAdd);
        state.lastRefill = now;
    }

    // Check if we have tokens available
    if (state.tokens > 0) {
        state.tokens--;
        return false; // Not rate limited
    }

    return true; // Rate limited
}

/**
 * Create a rate-limited fetch wrapper
 * @param key - Unique identifier for this endpoint
 * @param config - Rate limiter configuration
 */
export function createRateLimitedFetch(
    key: string,
    config: RateLimiterConfig = { maxRequests: 10, windowMs: 60000 }
) {
    return async function rateLimitedFetch(
        input: RequestInfo | URL,
        init?: RequestInit
    ): Promise<Response> {
        if (isRateLimited(key, config)) {
            throw new Error(`Rate limit exceeded for ${key}. Please wait before making more requests.`);
        }
        return fetch(input, init);
    };
}

/**
 * Debounce utility for user input driven requests
 */
export function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
    func: T,
    waitMs: number
): (...args: Parameters<T>) => void {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    return function debounced(...args: Parameters<T>) {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }

        timeoutId = setTimeout(() => {
            func(...args);
            timeoutId = null;
        }, waitMs);
    };
}
