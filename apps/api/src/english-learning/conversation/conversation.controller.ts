import {
  Controller, Get, Post, Body, Param, Query, Res, BadRequestException, NotFoundException, UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { ConversationService } from './conversation.service';
import { AiService } from '../ai/ai.service';
import { ApiKeyGuard } from '../../common/api-key.guard';

@Controller('conversation')
export class ConversationController {
  constructor(
    private readonly conversations: ConversationService,
    private readonly aiService: AiService,
  ) {}

  @Get()
  findAll() {
    return this.conversations.findAll();
  }

  @Get('adapter-status')
  getAdapterStatus() {
    return {
      currentAdapter: this.aiService.getCurrentAdapterName(),
      availableAdapters: this.aiService.getAvailableAdapters(),
    };
  }

  @Post('generate')
  @UseGuards(ApiKeyGuard)
  generate(@Body() body: { topic?: string; difficulty?: string }) {
    return this.conversations.generate(body.topic || 'Travel', body.difficulty);
  }

  @Post('regenerate-all-audio')
  @UseGuards(ApiKeyGuard)
  regenerateAllAudio(@Query('force') force?: string) {
    return this.conversations.regenerateAllAudio(force === 'true');
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.conversations.findOne(id);
  }

  @Get(':id/audio-status')
  async getAudioStatus(@Param('id') id: string) {
    const conversation = await this.conversations.findOne(id, true);
    return {
      audioGenerated: conversation.audioGenerated,
      lines: conversation.dialogue.map((line, index) => ({
        index,
        speaker: line.speaker,
        hasAudio: !!line.audio,
        audioUrl: line.audio ? `/api/conversation/${id}/audio/${index}` : null,
      })),
    };
  }

  @Get(':id/audio/:lineIndex')
  async getLineAudio(@Param('id') id: string, @Param('lineIndex') lineIndex: string, @Res() res: Response) {
    const index = parseInt(lineIndex, 10);
    if (isNaN(index) || index < 0) throw new BadRequestException('Invalid line index');

    const conversation = await this.conversations.findOne(id, true);
    const line = conversation.dialogue[index];
    if (!line) throw new NotFoundException(`Line ${index} not found in conversation`);
    if (!line.audio) throw new NotFoundException(`Audio not generated for line ${index}`);

    // Mongoose may hand back a BSON Binary instead of a Buffer
    const raw = line.audio as unknown as Buffer | { buffer: Buffer };
    const audio = Buffer.isBuffer(raw) ? raw : Buffer.from(raw.buffer);

    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': audio.length.toString(),
      'Cache-Control': 'public, max-age=31536000',
    });
    res.send(audio);
  }

  @Post(':id/regenerate-audio')
  @UseGuards(ApiKeyGuard)
  regenerateAudio(@Param('id') id: string) {
    return this.conversations.regenerateAudio(id);
  }
}
