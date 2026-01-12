/**
 * Tarot AI Rate Limiting Utilities
 * 
 * Client-side: localStorage-based
 * Server-side: IP-based (handled in actions.ts)
 */

import { DAILY_LIMIT } from "./config";

const STORAGE_KEY = 'tarot_ai_usage';

interface UsageData {
    count: number;
    date: string;
}

function getTodayString(): string {
    return new Date().toISOString().split('T')[0]; // YYYY-MM-DD
}

function getUsageData(): UsageData {
    if (typeof window === 'undefined') {
        return { count: 0, date: getTodayString() };
    }

    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) {
            return { count: 0, date: getTodayString() };
        }

        const data: UsageData = JSON.parse(stored);

        // Reset if it's a new day
        if (data.date !== getTodayString()) {
            return { count: 0, date: getTodayString() };
        }

        return data;
    } catch {
        return { count: 0, date: getTodayString() };
    }
}

function saveUsageData(data: UsageData): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/**
 * Check if client-side rate limit allows a request
 * @returns true if request is allowed
 */
export function checkClientRateLimit(): boolean {
    const usage = getUsageData();
    return usage.count < DAILY_LIMIT;
}

/**
 * Consume one request from client quota
 * Call this AFTER a successful API call
 */
export function consumeClientQuota(): void {
    const usage = getUsageData();
    usage.count += 1;
    saveUsageData(usage);
}

/**
 * Get remaining requests for today
 */
export function getRemainingRequests(): number {
    const usage = getUsageData();
    return Math.max(0, DAILY_LIMIT - usage.count);
}

/**
 * Get daily limit constant
 */
export function getDailyLimit(): number {
    return DAILY_LIMIT;
}

/**
 * Sync localStorage count with server (Redis) count
 * This ensures UI displays accurate count from Redis
 */
export function syncWithServerCount(serverRemaining: number): void {
    if (typeof window === 'undefined') return;

    const serverUsedCount = DAILY_LIMIT - serverRemaining;
    const usage: UsageData = {
        count: serverUsedCount,
        date: getTodayString()
    };
    saveUsageData(usage);
}
