import { Controller, Post, Body, Res, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';

@Controller('tts')
export class TtsController {
    private readonly logger = new Logger(TtsController.name);
    private readonly ttsServiceUrl: string;

    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService
    ) {
        this.ttsServiceUrl = this.configService.get<string>('TTS_SERVICE_URL') || 'http://localhost:3333/api/tts';
    }

    @Post('generate')
    async generate(@Body() body: any, @Res() res: Response) {
        this.logger.log(`Proxying TTS request for text: ${body.text}`);

        try {
            const response = await this.httpService.axiosRef({
                method: 'POST',
                url: `${this.ttsServiceUrl}/generate`,
                data: body,
                responseType: 'stream',
                proxy: false, // Bypass system proxy for localhost calls
            });

            res.set({
                'Content-Type': 'audio/wav',
                'Transfer-Encoding': 'chunked'
            });

            response.data.pipe(res);
        } catch (error) {
            this.logger.error('Error proxying TTS request', error);
            res.status(500).json({ message: 'Failed to generate speech' });
        }
    }
}
