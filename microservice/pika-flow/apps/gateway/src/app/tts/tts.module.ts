import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TtsController } from './tts.controller';

@Module({
    imports: [HttpModule],
    controllers: [TtsController],
})
export class TtsModule { }
