import { Controller, Post, Body, Res, BadRequestException, Query } from '@nestjs/common';
import { PiperService, AudioFormat } from './piper.service';
import type { Response } from 'express';

@Controller('tts')
export class TtsController {
    constructor(private readonly piperService: PiperService) { }

    /**
     * Stream WAV audio (for real-time playback)
     */
    @Post('generate')
    async generate(@Body() body: { text: string; model?: string }, @Res() res: Response) {
        const { text, model } = body;

        if (!text) {
            throw new BadRequestException('Text is required');
        }

        try {
            const audioStream = await this.piperService.generateAudio(text, model);

            res.set({
                'Content-Type': 'audio/wav',
                'Transfer-Encoding': 'chunked',
            });

            audioStream.pipe(res);
        } catch (error: any) {
            throw new BadRequestException(error.message);
        }
    }

    /**
     * Generate audio buffer with configurable format
     * POST /api/tts/generate-buffer?format=mp3
     */
    @Post('generate-buffer')
    async generateBuffer(
        @Body() body: { text: string; model?: string },
        @Query('format') format: string = 'mp3',
        @Res() res: Response
    ) {
        const { text, model } = body;

        if (!text) {
            throw new BadRequestException('Text is required');
        }

        const audioFormat: AudioFormat = format === 'wav' ? 'wav' : 'mp3';

        try {
            const buffer = await this.piperService.generateBuffer(text, model, audioFormat);

            res.set({
                'Content-Type': this.piperService.getMimeType(audioFormat),
                'Content-Length': buffer.length.toString(),
            });

            res.send(buffer);
        } catch (error: any) {
            throw new BadRequestException(error.message);
        }
    }
}
