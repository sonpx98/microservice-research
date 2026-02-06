import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import type { Job } from 'bull';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Conversation, ConversationDocument } from '../../../../../libs/common/src/schemas/conversation.schema';
import axios from 'axios';

interface ConversationJobData {
    topic: string;
    difficulty: string;
    dialogue: Array<{ speaker: string; text: string }>;
}

@Processor('conversation_queue')
export class ConversationConsumer {
    private readonly logger = new Logger(ConversationConsumer.name);
    private readonly ttsServiceUrl = process.env.TTS_SERVICE_URL || 'http://localhost:3333/api/tts';

    constructor(
        @InjectModel(Conversation.name) private conversationModel: Model<ConversationDocument>
    ) { }

    private getVoiceModel(speaker: string): string {
        // Person A uses Ryan (male voice), Person B uses Lessac (female voice)
        return speaker.includes('A') ? 'en_US-ryan-low' : 'en_US-lessac-low';
    }

    private async generateAudioForLine(text: string, speaker: string): Promise<Buffer | null> {
        try {
            const model = this.getVoiceModel(speaker);
            const response = await axios.post(
                `${this.ttsServiceUrl}/generate-buffer?format=mp3`,
                { text, model },
                {
                    responseType: 'arraybuffer',
                    timeout: 60000, // 60 second timeout for slow VPS
                    proxy: false  // Bypass system proxy for localhost
                }
            );
            return Buffer.from(response.data);
        } catch (error) {
            this.logger.error(`Failed to generate audio for: "${text}"`, error);
            return null;
        }
    }

    @Process('save_conversation')
    async handleSave(job: Job<ConversationJobData>) {
        this.logger.log(`Processing conversation save job for topic: ${job.data.topic}`);
        const { topic, difficulty, dialogue } = job.data;

        try {
            // Validation
            if (!dialogue || dialogue.length === 0) {
                throw new Error('Invalid conversation data: dialogue is empty');
            }

            if (!topic || !difficulty) {
                throw new Error('Invalid conversation data: missing topic or difficulty');
            }

            // Generate audio for each line
            this.logger.log(`Generating audio for ${dialogue.length} lines...`);
            const dialogueWithAudio = [];

            for (let i = 0; i < dialogue.length; i++) {
                const line = dialogue[i];
                this.logger.log(`Generating audio ${i + 1}/${dialogue.length}: "${line.text.substring(0, 30)}..."`);

                const audio = await this.generateAudioForLine(line.text, line.speaker);

                dialogueWithAudio.push({
                    speaker: line.speaker,
                    text: line.text,
                    audio: audio // Buffer or null
                });
            }

            const audioGenerated = dialogueWithAudio.every(d => d.audio !== null);

            // Save to MongoDB
            const newConversation = new this.conversationModel({
                topic,
                difficulty,
                dialogue: dialogueWithAudio,
                audioGenerated
            });

            await newConversation.save();
            this.logger.log(`Successfully saved conversation for topic: ${topic} (${dialogue.length} lines, audio: ${audioGenerated ? 'yes' : 'partial'})`);

        } catch (error) {
            this.logger.error(`Failed to save conversation for job ${job.id}`, error);
            throw error;
        }
    }
}
