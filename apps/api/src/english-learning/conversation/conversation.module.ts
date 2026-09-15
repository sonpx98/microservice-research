import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Conversation, ConversationSchema } from '../../common/schemas';
import { AiModule } from '../ai/ai.module';
import { TtsModule } from '../../tts/tts.module';
import { ConversationController } from './conversation.controller';
import { ConversationService } from './conversation.service';
import { ConversationScheduler } from './conversation.scheduler';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Conversation.name, schema: ConversationSchema }]),
    AiModule,
    TtsModule,
  ],
  controllers: [ConversationController],
  providers: [ConversationService, ConversationScheduler],
})
export class ConversationModule {}
