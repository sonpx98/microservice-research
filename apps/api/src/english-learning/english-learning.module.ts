import { Module } from '@nestjs/common';
import { ReadingModule } from './reading/reading.module';
import { ConversationModule } from './conversation/conversation.module';

@Module({
  imports: [ReadingModule, ConversationModule],
})
export class EnglishLearningModule {}
