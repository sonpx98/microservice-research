import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConversationController } from './conversation.controller';
import { Conversation, ConversationSchema } from '../../../../../libs/common/src/schemas/conversation.schema';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Conversation.name, schema: ConversationSchema }]),
    ],
    controllers: [ConversationController],
})
export class ConversationModule { }
