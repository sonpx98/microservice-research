import { Body, Controller, Post, Get, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { AiService } from '../ai/ai.service';

@Controller('conversation')
export class ConversationController {
    private readonly logger = new Logger(ConversationController.name);

    constructor(
        @InjectQueue('conversation_queue') private conversationQueue: Queue,
        private aiService: AiService
    ) { }

    /**
     * Manual trigger for testing conversation generation
     * POST /api/conversation/trigger-dev
     */
    @Post('trigger-dev')
    async triggerDev(@Body() body: { topic?: string }) {
        const topic = body.topic || 'Travel';
        const difficulty = 'Intermediate';

        this.logger.log(`Manually triggering conversation generation for topic: ${topic}`);
        this.logger.log(`Current adapter: ${this.aiService.getCurrentAdapterName()}`);

        try {
            // Step 1: Generate content via AI (with fallback)
            const prompt = `Generate a natural, engaging English conversation between two friends (Person A and Person B) about "${topic}".

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

            this.logger.log(`Generating conversation via ${this.aiService.getCurrentAdapterName()}...`);
            const generatedData = await this.aiService.generateConversation(prompt);

            if (!generatedData.dialogue || generatedData.dialogue.length === 0) {
                throw new Error('Generated conversation has no dialogue');
            }

            // Step 2: Push GENERATED CONTENT to queue
            const job = await this.conversationQueue.add('save_conversation', {
                topic: topic,
                difficulty: difficulty,
                dialogue: generatedData.dialogue
            });

            this.logger.log(`Added generated conversation to queue (${generatedData.dialogue.length} lines)`);

            return {
                message: 'Conversation generated and queued for saving',
                jobId: job.id,
                adapter: this.aiService.getCurrentAdapterName(),
                dialogueLines: generatedData.dialogue.length,
                preview: generatedData.dialogue.slice(0, 2)
            };

        } catch (error) {
            this.logger.error(`Failed to generate conversation: ${error}`);
            throw error;
        }
    }

    /**
     * Get current AI adapter status
     * GET /api/conversation/adapter-status
     */
    @Get('adapter-status')
    getAdapterStatus() {
        return {
            currentAdapter: this.aiService.getCurrentAdapterName(),
            availableAdapters: this.aiService.getAvailableAdapters()
        };
    }
}
