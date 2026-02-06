import { Controller, Get, Post, Param, NotFoundException, Res, BadRequestException, Logger, Query } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import type { Response } from 'express';
import axios from 'axios';
import { Conversation, ConversationDocument } from '../../../../../libs/common/src/schemas/conversation.schema';

@Controller('conversation')
export class ConversationController {
    private readonly logger = new Logger(ConversationController.name);
    private readonly ttsServiceUrl = process.env.TTS_SERVICE_URL || 'http://localhost:3333/api/tts';

    constructor(
        @InjectModel(Conversation.name) private conversationModel: Model<ConversationDocument>
    ) { }

    private getVoiceModel(speaker: string): string {
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
                    timeout: 60000,
                    proxy: false  // Bypass system proxy for localhost
                }
            );
            return Buffer.from(response.data);
        } catch (error) {
            this.logger.error(`Failed to generate audio for: "${text}"`, error);
            return null;
        }
    }

    @Get()
    async findAll() {
        return this.conversationModel
            .find()
            .select('-dialogue.audio')
            .sort({ createdAt: -1 })
            .exec();
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        const conversation = await this.conversationModel
            .findById(id)
            .select('-dialogue.audio')
            .exec();
        if (!conversation) {
            throw new NotFoundException(`Conversation with ID ${id} not found`);
        }
        return conversation;
    }

    @Get(':id/audio/:lineIndex')
    async getLineAudio(
        @Param('id') id: string,
        @Param('lineIndex') lineIndex: string,
        @Res() res: Response
    ) {
        const index = parseInt(lineIndex, 10);
        if (isNaN(index) || index < 0) {
            throw new BadRequestException('Invalid line index');
        }

        const conversation = await this.conversationModel.findById(id).exec();
        if (!conversation) {
            throw new NotFoundException(`Conversation with ID ${id} not found`);
        }

        if (index >= conversation.dialogue.length) {
            throw new NotFoundException(`Line ${index} not found in conversation`);
        }

        const line = conversation.dialogue[index];

        if (!line.audio) {
            this.logger.error(`Audio missing for conversation ${id} line ${index}`);
            throw new NotFoundException(`Audio not generated for line ${index}`);
        }

        let audioBuffer: Buffer;
        if (Buffer.isBuffer(line.audio)) {
            audioBuffer = line.audio;
        } else if (line.audio && (line.audio as any).buffer && Buffer.isBuffer((line.audio as any).buffer)) {
            // Handle BSON Binary
            this.logger.log(`Converting BSON Binary to Buffer for ${id} line ${index}`);
            audioBuffer = (line.audio as any).buffer;
        } else {
            this.logger.warn(`Unknown audio format: ${typeof line.audio} - ${(line.audio as any)?.constructor?.name}`);
            audioBuffer = Buffer.from(line.audio as any);
        }

        this.logger.log(`Serving audio for ${id} line ${index}, size: ${audioBuffer.length} bytes`);

        res.set({
            'Content-Type': 'audio/mpeg',
            'Content-Length': audioBuffer.length.toString(),
            'Cache-Control': 'public, max-age=31536000',
        });

        res.send(audioBuffer);
    }

    @Get(':id/audio-status')
    async getAudioStatus(@Param('id') id: string) {
        const conversation = await this.conversationModel
            .findById(id)
            .select('audioGenerated dialogue.speaker dialogue.text')
            .exec();

        if (!conversation) {
            throw new NotFoundException(`Conversation with ID ${id} not found`);
        }

        return {
            audioGenerated: conversation.audioGenerated,
            lines: conversation.dialogue.map((line, index) => ({
                index,
                speaker: line.speaker,
                hasAudio: !!line.audio,
                audioUrl: line.audio ? `/api/conversation/${id}/audio/${index}` : null
            }))
        };
    }

    /**
     * Regenerate audio for a single conversation
     * POST /api/conversation/:id/regenerate-audio
     */
    @Post(':id/regenerate-audio')
    async regenerateAudio(@Param('id') id: string) {
        const conversation = await this.conversationModel.findById(id).exec();
        if (!conversation) {
            throw new NotFoundException(`Conversation with ID ${id} not found`);
        }

        this.logger.log(`Regenerating audio for conversation: ${id} (${conversation.topic})`);

        const updatedDialogue = [];
        for (let i = 0; i < conversation.dialogue.length; i++) {
            const line = conversation.dialogue[i];
            this.logger.log(`Generating audio ${i + 1}/${conversation.dialogue.length}`);

            const audio = await this.generateAudioForLine(line.text, line.speaker);
            updatedDialogue.push({
                speaker: line.speaker,
                text: line.text,
                audio: audio
            });
        }

        const audioGenerated = updatedDialogue.every(d => d.audio !== null);

        await this.conversationModel.findByIdAndUpdate(id, {
            dialogue: updatedDialogue,
            audioGenerated
        });

        return {
            message: 'Audio regenerated',
            conversationId: id,
            topic: conversation.topic,
            linesProcessed: conversation.dialogue.length,
            audioGenerated
        };
    }

    /**
     * Regenerate audio for all conversations without audio
     * POST /api/conversation/regenerate-all-audio
     */
    @Post('regenerate-all-audio')
    async regenerateAllAudio(@Query('force') force: string) {
        const filter = force === 'true' ? {} : { audioGenerated: { $ne: true } };

        const conversations = await this.conversationModel
            .find(filter)
            .select('_id topic dialogue')
            .exec();

        this.logger.log(`Found ${conversations.length} conversations without audio`);

        const results = [];
        for (const conv of conversations) {
            this.logger.log(`Processing: ${conv.topic} (${conv._id})`);

            const updatedDialogue = [];
            for (let i = 0; i < conv.dialogue.length; i++) {
                const line = conv.dialogue[i];
                this.logger.log(`  Line ${i + 1}/${conv.dialogue.length}`);

                const audio = await this.generateAudioForLine(line.text, line.speaker);
                updatedDialogue.push({
                    speaker: line.speaker,
                    text: line.text,
                    audio: audio
                });
            }

            const audioGenerated = updatedDialogue.every(d => d.audio !== null);

            await this.conversationModel.findByIdAndUpdate(conv._id, {
                dialogue: updatedDialogue,
                audioGenerated
            });

            results.push({
                id: conv._id,
                topic: conv.topic,
                audioGenerated
            });
        }

        return {
            message: 'Batch audio regeneration complete',
            processed: results.length,
            results
        };
    }
}
