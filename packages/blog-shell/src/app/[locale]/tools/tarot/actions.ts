'use server';

import { TarotCard, ReadingType } from "./types";
import Groq from "groq-sdk";
import { headers } from "next/headers";
import { checkIPRateLimit, getIPRemainingRequests } from "@/lib/redis-rate-limiter";
import { buildPrompt } from "./utils/prompt-templates";
import { DAILY_LIMIT } from "./utils/config";

/**
 * Extract client IP from request headers
 */
async function getClientIP(): Promise<string> {
    const headersList = await headers();
    const forwardedFor = headersList.get('x-forwarded-for');
    const realIp = headersList.get('x-real-ip');
    return forwardedFor?.split(',')[0]?.trim() || realIp || 'unknown';
}

/**
 * Get remaining requests for current user from Redis
 */
export async function getServerRemainingRequests(): Promise<{ remaining: number; hasRedis: boolean }> {
    const clientIp = await getClientIP();

    try {
        const remaining = await getIPRemainingRequests(clientIp);
        return { remaining, hasRedis: true };
    } catch {
        return { remaining: DAILY_LIMIT, hasRedis: false };
    }
}

export interface AIReadingResponse {
    interpretation: string;
    advice: string;
    meditation: string;
    rateLimited?: boolean;
    error?: string;
}

export async function generateAIReading(
    cards: TarotCard[],
    readingType: ReadingType
): Promise<AIReadingResponse> {
    const clientIp = await getClientIP();

    // Check IP-based rate limit using Redis
    const rateLimitResult = await checkIPRateLimit(clientIp);
    if (!rateLimitResult.success) {
        return {
            interpretation: '',
            advice: '',
            meditation: '',
            rateLimited: true,
            error: `Bạn đã sử dụng hết ${DAILY_LIMIT} lượt hôm nay. Quay lại vào ngày mai nhé! 🌙`
        };
    }

    const apiKey = process.env.GROQ_API_KEY || process.env.NEXT_PUBLIC_GROQ_API_KEY;

    if (!apiKey) {
        throw new Error("Missing Groq API Key");
    }

    const groq = new Groq({ apiKey });

    // Build topic-specific prompt
    const prompt = buildPrompt(cards, readingType);

    // Debug log (development only)
    if (process.env.NODE_ENV === 'development') {
        console.log('[Tarot AI] Generated Prompt:\n', prompt);
    }

    try {
        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: "Bạn là người đọc Tarot thân thiện. Viết tiếng Việt tự nhiên, gần gũi như nói chuyện với bạn thân. Trả về JSON hợp lệ." },
                { role: "user", content: prompt }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.7,
            max_tokens: 1500,
            response_format: { type: "json_object" }
        });

        const content = completion.choices[0]?.message?.content;
        if (!content) throw new Error("No content from API");

        const parsed = JSON.parse(content);

        return {
            interpretation: parsed.interpretation || "Không thể tạo lời giải.",
            advice: parsed.advice || "Hãy lắng nghe trực giác của bạn.",
            meditation: parsed.meditation || "Tĩnh lặng để tìm câu trả lời."
        };
    } catch (error) {
        console.error("AI Reading Error:", error);
        throw new Error("Failed to generate reading");
    }
}
