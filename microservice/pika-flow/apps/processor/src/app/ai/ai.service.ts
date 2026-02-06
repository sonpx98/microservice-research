import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Groq from 'groq-sdk';

@Injectable()
export class AiService {
    private groq: Groq;
    private readonly logger = new Logger(AiService.name);

    constructor(private configService: ConfigService) {
        const apiKey = this.configService.get<string>('GROQ_API_KEY');
        if (!apiKey) {
            this.logger.warn('GROQ_API_KEY is not set');
        }
        this.groq = new Groq({ apiKey });
    }

    async generateText(prompt: string): Promise<string> {
        try {
            const completion = await this.groq.chat.completions.create({
                messages: [{ role: 'user', content: prompt }],
                model: 'llama-3.3-70b-versatile',
                temperature: 0.7,
            });
            return completion.choices[0]?.message?.content || '';
        } catch (error) {
            this.logger.error('Error generating text with Groq', error);
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
                model: 'llama-3.3-70b-versatile',
                temperature: 0.7,
                response_format: { type: 'json_object' }
            });

            const content = completion.choices[0]?.message?.content;
            if (!content) throw new Error('No content generated');
            return JSON.parse(content) as T;
        } catch (error) {
            this.logger.error('Error generating JSON with Groq', error);
            throw error;
        }
    }
}
