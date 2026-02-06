import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PiperService } from './piper.service';
import { TtsController } from './tts.controller';

@Module({
  imports: [],
  controllers: [AppController, TtsController],
  providers: [AppService, PiperService],
})
export class AppModule { }
