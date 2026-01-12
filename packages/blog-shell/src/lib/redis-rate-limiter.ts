/**
 * Redis-based Rate Limiter for Tarot AI
 * 
 * Uses same Redis config format as pika-flow:
 * - REDIS_HOST, REDIS_PORT, REDIS_PASSWORD, REDIS_TLS
 * 
 * Works for both local Redis and Upstash.
 */

import IORedis from "ioredis";
import { DAILY_LIMIT, DAY_IN_SECONDS, RATE_LIMIT_KEY_PREFIX } from "@/app/[locale]/tools/tarot/utils/config";

// Redis client singleton
let redis: IORedis | null = null;
let connectionFailed = false;

/**
 * Get or create Redis client
 */
function getRedisClient(): IORedis | null {
    if (redis) return redis;
    if (connectionFailed) return null;

    const host = process.env.REDIS_HOST;
    const port = parseInt(process.env.REDIS_PORT || '6379');
    const password = process.env.REDIS_PASSWORD;
    const tls = process.env.REDIS_TLS === 'true';

    if (!host) {
        console.warn("[Tarot Rate Limit] REDIS_HOST not set. IP rate limiting disabled.");
        return null;
    }

    try {
        redis = new IORedis({
            host,
            port,
            password: password || undefined,
            tls: tls ? {} : undefined,
            maxRetriesPerRequest: 3,
            retryStrategy: (times) => {
                if (times > 3) {
                    connectionFailed = true;
                    return null;
                }
                return Math.min(times * 100, 3000);
            },
        });

        redis.on('error', (err) => {
            console.error("[Tarot Rate Limit] Redis error:", err.message);
        });

        redis.on('connect', () => {
            console.log(`[Tarot Rate Limit] Connected to Redis: ${host}:${port}`);
        });

        return redis;
    } catch (error) {
        console.error("[Tarot Rate Limit] Failed to create Redis client:", error);
        connectionFailed = true;
        return null;
    }
}

/**
 * Build rate limit key for an IP
 */
function buildRateLimitKey(ip: string): string {
    const now = Math.floor(Date.now() / 1000);
    const dayStart = now - (now % DAY_IN_SECONDS);
    return `${RATE_LIMIT_KEY_PREFIX}:${ip}:${dayStart}`;
}

export interface RateLimitResult {
    success: boolean;
    remaining: number;
    reset: number;
}

/**
 * Check if IP is rate limited
 */
export async function checkIPRateLimit(ip: string): Promise<RateLimitResult> {
    const client = getRedisClient();

    if (!client) {
        return { success: true, remaining: DAILY_LIMIT, reset: 0 };
    }

    const key = buildRateLimitKey(ip);
    const now = Math.floor(Date.now() / 1000);
    const dayStart = now - (now % DAY_IN_SECONDS);

    try {
        const current = await client.get(key);
        const count = current ? parseInt(current, 10) : 0;

        if (count >= DAILY_LIMIT) {
            return {
                success: false,
                remaining: 0,
                reset: dayStart + DAY_IN_SECONDS,
            };
        }

        await client.multi()
            .incr(key)
            .expire(key, DAY_IN_SECONDS)
            .exec();

        return {
            success: true,
            remaining: DAILY_LIMIT - count - 1,
            reset: dayStart + DAY_IN_SECONDS,
        };
    } catch (error) {
        console.error("[Tarot Rate Limit] Redis operation error:", error);
        return { success: true, remaining: DAILY_LIMIT, reset: 0 };
    }
}

/**
 * Get remaining requests for an IP (without consuming quota)
 */
export async function getIPRemainingRequests(ip: string): Promise<number> {
    const client = getRedisClient();

    if (!client) {
        return DAILY_LIMIT;
    }

    const key = buildRateLimitKey(ip);

    try {
        const current = await client.get(key);
        const count = current ? parseInt(current, 10) : 0;
        return Math.max(0, DAILY_LIMIT - count);
    } catch {
        return DAILY_LIMIT;
    }
}
