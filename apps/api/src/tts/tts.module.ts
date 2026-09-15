import { Module } from '@nestjs/common';
import { PiperService } from './piper.service';
import { TtsController } from './tts.controller';

@Module({
  controllers: [TtsController],
  providers: [PiperService],
  exports: [PiperService],
})
export class TtsModule {}
