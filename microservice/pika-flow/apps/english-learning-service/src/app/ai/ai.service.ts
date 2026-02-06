import { Injectable, Logger } from '@nestjs/common';
import type { AiAdapter } from './adapters/ai-adapter.interface';
import { GroqLlama8bAdapter } from './adapters/groq-llama8b.adapter';
import { GeminiAdapter } from './adapters/gemini.adapter';
import { GroqLlama70bAdapter } from './adapters/groq.adapter';

@Injectable()
export class AiService {
    private readonly logger = new Logger(AiService.name);
    private adapters: AiAdapter[] = [];
    private currentAdapterIndex = 0;

    constructor(
        private groqLlama8bAdapter: GroqLlama8bAdapter,
        private geminiAdapter: GeminiAdapter,
        private groqLlama70bAdapter: GroqLlama70bAdapter
    ) {
        // Register adapters in priority order:
        // 1. Groq Llama-3.1-8b (fastest, cheapest)
        // 2. Gemini Flash 1.5 (fallback)
        // 3. Groq Llama-3.3-70b (most powerful, last resort)
        if (this.groqLlama8bAdapter.isAvailable()) {
            this.adapters.push(this.groqLlama8bAdapter);
            this.logger.log('Registered Groq Llama-3.1-8b adapter (primary)');
        }
        if (this.geminiAdapter.isAvailable()) {
            this.adapters.push(this.geminiAdapter);
            this.logger.log('Registered Gemini adapter (fallback 1)');
        }
        if (this.groqLlama70bAdapter.isAvailable()) {
            this.adapters.push(this.groqLlama70bAdapter);
            this.logger.log('Registered Groq Llama-3.3-70b adapter (fallback 2)');
        }

        if (this.adapters.length === 0) {
            this.logger.error('No AI adapters available! Please configure at least one API key.');
        } else {
            this.logger.log(`Primary adapter: ${this.adapters[0].name}`);
        }
    }

    private get currentAdapter(): AiAdapter {
        return this.adapters[this.currentAdapterIndex];
    }

    private isRateLimitError(error: unknown): boolean {
        if (error instanceof Error) {
            const message = error.message.toLowerCase();
            return message.includes('rate_limit') ||
                message.includes('quota') ||
                message.includes('429') ||
                message.includes('resource_exhausted');
        }
        return false;
    }

    private async executeWithFallback<T>(
        operation: (adapter: AiAdapter) => Promise<T>
    ): Promise<T> {
        let lastError: Error | null = null;

        for (let i = 0; i < this.adapters.length; i++) {
            const adapterIndex = (this.currentAdapterIndex + i) % this.adapters.length;
            const adapter = this.adapters[adapterIndex];

            try {
                this.logger.debug(`Trying adapter: ${adapter.name}`);
                const result = await operation(adapter);

                // If successful and we switched adapters, update current
                if (i > 0) {
                    this.currentAdapterIndex = adapterIndex;
                    this.logger.log(`Switched to adapter: ${adapter.name}`);
                }

                return result;
            } catch (error) {
                lastError = error as Error;
                this.logger.warn(`Adapter ${adapter.name} failed: ${lastError.message}`);

                if (this.isRateLimitError(error) && i < this.adapters.length - 1) {
                    this.logger.log(`Rate limit hit on ${adapter.name}, falling back to next adapter...`);
                    continue;
                }

                // If not a rate limit error, don't try other adapters
                if (!this.isRateLimitError(error)) {
                    throw error;
                }
            }
        }

        throw lastError || new Error('All AI adapters failed');
    }

    async generateText(prompt: string): Promise<string> {
        return this.executeWithFallback(adapter => adapter.generateText(prompt));
    }

    async generateJson<T>(prompt: string): Promise<T> {
        return this.executeWithFallback(adapter => adapter.generateJson<T>(prompt));
    }

    /**
     * Get current active adapter name
     */
    getCurrentAdapterName(): string {
        return this.currentAdapter?.name || 'None';
    }

    /**
     * Manually switch to a specific adapter by name
     */
    setAdapter(name: string): boolean {
        const index = this.adapters.findIndex(a => a.name.toLowerCase() === name.toLowerCase());
        if (index >= 0) {
            this.currentAdapterIndex = index;
            this.logger.log(`Manually switched to adapter: ${this.adapters[index].name}`);
            return true;
        }
        this.logger.warn(`Adapter not found: ${name}`);
        return false;
    }

    /**
     * Get list of all registered adapter names
     */
    getAvailableAdapters(): string[] {
        return this.adapters.map(a => a.name);
    }

    // ============================================================
    // Response Normalizers - Handle different AI output formats
    // ============================================================

    /**
     * Standard dialogue line format
     */
    private normalizeDialogueLine(line: unknown): { speaker: string; text: string } | null {
        if (!line || typeof line !== 'object') return null;

        const obj = line as Record<string, unknown>;

        // Normalize speaker field (could be: speaker, name, person, role, character)
        const speaker = obj.speaker || obj.name || obj.person || obj.role || obj.character;

        // Normalize text field (could be: text, content, message, line, dialogue)
        const text = obj.text || obj.content || obj.message || obj.line || obj.dialogue;

        if (typeof speaker === 'string' && typeof text === 'string') {
            return { speaker, text };
        }

        return null;
    }

    /**
     * Normalize conversation response from any AI model
     * Handles various output formats and transforms to standard format
     */
    normalizeConversation(data: unknown): { dialogue: Array<{ speaker: string; text: string }> } {
        if (!data || typeof data !== 'object') {
            throw new Error('Invalid response: not an object');
        }

        const obj = data as Record<string, unknown>;
        let rawDialogue: unknown[] | null = null;

        // Try different field names for dialogue array
        if (Array.isArray(obj.dialogue)) {
            rawDialogue = obj.dialogue;
        } else if (Array.isArray(obj.conversation)) {
            rawDialogue = obj.conversation;
        } else if (Array.isArray(obj.messages)) {
            rawDialogue = obj.messages;
        } else if (Array.isArray(obj.lines)) {
            rawDialogue = obj.lines;
        } else if (Array.isArray(obj.script)) {
            rawDialogue = obj.script;
        } else if (Array.isArray(data)) {
            // Response is array directly
            rawDialogue = data as unknown[];
        }

        if (!rawDialogue || rawDialogue.length === 0) {
            throw new Error('Invalid response: no dialogue array found');
        }

        // Normalize each line
        const dialogue = rawDialogue
            .map(line => this.normalizeDialogueLine(line))
            .filter((line): line is { speaker: string; text: string } => line !== null);

        if (dialogue.length === 0) {
            throw new Error('Invalid response: no valid dialogue lines after normalization');
        }

        this.logger.log(`Normalized ${dialogue.length} dialogue lines from ${rawDialogue.length} raw lines`);
        return { dialogue };
    }

    /**
     * Generate conversation with automatic normalization
     * Use this instead of raw generateJson for conversation generation
     */
    async generateConversation(prompt: string): Promise<{ dialogue: Array<{ speaker: string; text: string }> }> {
        const rawResponse = await this.generateJson<unknown>(prompt);
        return this.normalizeConversation(rawResponse);
    }
}

