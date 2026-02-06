import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Groq from 'groq-sdk';
import type { AiAdapter } from './ai-adapter.interface';

/**
 * Groq Adapter for llama-3.1-8b-instant model
 * This is the fastest and most cost-effective model, used as primary
 */
@Injectable()
export class GroqLlama8bAdapter implements AiAdapter {
    readonly name = 'Groq-Llama-3.1-8b';
    private groq: Groq;
    private readonly logger = new Logger(GroqLlama8bAdapter.name);
    private apiKey: string | undefined;
    private readonly modelName = 'llama-3.1-8b-instant';

    constructor(private configService: ConfigService) {
        this.apiKey = this.configService.get<string>('GROQ_API_KEY');
        if (!this.apiKey) {
            this.logger.warn('GROQ_API_KEY is not set');
        }
        this.groq = new Groq({ apiKey: this.apiKey });
    }

    isAvailable(): boolean {
        return !!this.apiKey;
    }

    async generateText(prompt: string): Promise<string> {
        try {
            const completion = await this.groq.chat.completions.create({
                messages: [{ role: 'user', content: prompt }],
                model: this.modelName,
                temperature: 0.7,
            });
            return completion.choices[0]?.message?.content || '';
        } catch (error) {
            this.logger.error(`Error generating text with ${this.modelName}`, error);
            throw error;
        }
    }

    async generateJson<T>(prompt: string): Promise<T> {
        try {
            const completion = await this.groq.chat.completions.create({
                messages: [
                    { role: 'system', content: 'You are a helpful assistant that outputs JSON.' },
                    { role: 'user', content: prompt }
                ],
                model: this.modelName,
                temperature: 0.7,
                response_format: { type: 'json_object' }
            });

            const content = completion.choices[0]?.message?.content;
            if (!content) throw new Error('No content generated');
            return JSON.parse(content) as T;
        } catch (error) {
            this.logger.error(`Error generating JSON with ${this.modelName}`, error);
            throw error;
        }
    }
}
