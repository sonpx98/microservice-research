import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';
import type { AiAdapter } from './ai-adapter.interface';

@Injectable()
export class GeminiAdapter implements AiAdapter {
    readonly name = 'Gemini';
    private genAI: GoogleGenAI;
    private readonly logger = new Logger(GeminiAdapter.name);
    private apiKey: string | undefined;
    private readonly modelName = 'gemini-1.5-flash';

    constructor(private configService: ConfigService) {
        this.apiKey = this.configService.get<string>('GEMINI_API_KEY');
        if (!this.apiKey) {
            this.logger.warn('GEMINI_API_KEY is not set');
        }
        this.genAI = new GoogleGenAI({ apiKey: this.apiKey || '' });
    }

    isAvailable(): boolean {
        return !!this.apiKey;
    }

    async generateText(prompt: string): Promise<string> {
        try {
            const response = await this.genAI.models.generateContent({
                model: this.modelName,
                contents: prompt,
            });
            return response.text || '';
        } catch (error) {
            this.logger.error('Error generating text with Gemini', error);
            throw error;
        }
    }

    async generateJson<T>(prompt: string): Promise<T> {
        try {
            // Gemini doesn't have native JSON mode, so we use prompt engineering
            const jsonPrompt = `${prompt}

IMPORTANT: Respond ONLY with valid JSON. No markdown, no code blocks, no explanations. Just the raw JSON object.`;

            const response = await this.genAI.models.generateContent({
                model: this.modelName,
                contents: jsonPrompt,
                config: {
                    responseMimeType: 'application/json',
                }
            });

            const content = response.text;
            if (!content) throw new Error('No content generated');

            // Clean up potential markdown code blocks
            let cleanedContent = content.trim();
            if (cleanedContent.startsWith('```json')) {
                cleanedContent = cleanedContent.slice(7);
            }
            if (cleanedContent.startsWith('```')) {
                cleanedContent = cleanedContent.slice(3);
            }
            if (cleanedContent.endsWith('```')) {
                cleanedContent = cleanedContent.slice(0, -3);
            }

            return JSON.parse(cleanedContent.trim()) as T;
        } catch (error) {
            this.logger.error('Error generating JSON with Gemini', error);
            throw error;
        }
    }
}
