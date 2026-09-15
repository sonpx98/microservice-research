import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Conversation, ConversationSchema } from '../../common/schemas';
import { TtsModule } from '../../tts/tts.module';
import { ConversationController } from './conversation.controller';
import { ConversationService } from './conversation.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Conversation.name, schema: ConversationSchema }]), TtsModule],
  controllers: [ConversationController],
  providers: [ConversationService],
})
export class ConversationModule {}
