import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { Cron } from '@nestjs/schedule';
import { AiService } from '../ai/ai.service';

@Injectable()
export class ConversationScheduler {
    private readonly logger = new Logger(ConversationScheduler.name);
    private readonly topics = ['Travel', 'Business', 'Technology', 'Health', 'Education', 'Food'];

    constructor(
        @InjectQueue('conversation_queue') private conversationQueue: Queue,
        private aiService: AiService
    ) { }

    @Cron('0 0,8 * * *') // 7 AM and 3 PM Vietnam time (UTC+7)
    async handleCron() {
        this.logger.log('Triggering scheduled conversation generation');
        const randomTopic = this.topics[Math.floor(Math.random() * this.topics.length)];
        const difficulty = 'Intermediate';

        try {
            // Step 1: Generate content via Groq API
            const prompt = `Generate a natural, engaging English conversation between two friends (Person A and Person B) about "${randomTopic}".

Requirements:
- Create a realistic small talk conversation like everyday life discussions
- Include 12-16 dialogue exchanges (24-32 lines total)
- Use natural filler words, reactions, and expressions (e.g., "Oh really?", "You know what I mean?", "That's so true!")
- Include idioms, phrasal verbs, and colloquial expressions appropriate for ${difficulty} level
- Show emotions, opinions, and personal stories
- Include some interruptions, agreements, and follow-up questions
- Make it feel like a genuine casual conversation between friends

Return valid JSON with this structure:
{
    "dialogue": [
        { "speaker": "Person A", "text": "Hey! Long time no see! How have you been?" },
        { "speaker": "Person B", "text": "Oh my gosh, I know right? It's been ages! I've been super busy with..." }
    ]
}`;

            this.logger.log(`Generating conversation for topic: ${randomTopic}`);
            const generatedData = await this.aiService.generateConversation(prompt);

            if (!generatedData.dialogue || generatedData.dialogue.length === 0) {
                this.logger.error('Generated conversation has no dialogue');
                return;
            }

            // Step 2: Push GENERATED CONTENT to queue (not prompt)
            await this.conversationQueue.add('save_conversation', {
                topic: randomTopic,
                difficulty: difficulty,
                dialogue: generatedData.dialogue
            });

            this.logger.log(`Added generated conversation to queue for topic: ${randomTopic} (${generatedData.dialogue.length} lines)`);

        } catch (error) {
            this.logger.error(`Failed to generate conversation for ${randomTopic}`, error);
        }
    }
}
