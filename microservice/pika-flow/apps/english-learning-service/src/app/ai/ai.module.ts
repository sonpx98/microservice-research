import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AiService } from './ai.service';
import { GroqLlama8bAdapter } from './adapters/groq-llama8b.adapter';
import { GeminiAdapter } from './adapters/gemini.adapter';
import { GroqLlama70bAdapter } from './adapters/groq.adapter';

@Module({
    imports: [ConfigModule],
    providers: [GroqLlama8bAdapter, GeminiAdapter, GroqLlama70bAdapter, AiService],
    exports: [AiService],
})
export class AiModule { }
