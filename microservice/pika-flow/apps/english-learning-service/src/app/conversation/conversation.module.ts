import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConversationController } from './conversation.controller';
import { ConversationScheduler } from './conversation.scheduler';
import { AiModule } from '../ai/ai.module';

@Module({
    imports: [
        BullModule.registerQueue({
            name: 'conversation_queue',
        }),
        AiModule,
    ],
    controllers: [ConversationController],
    providers: [ConversationScheduler],
})
export class ConversationModule { }

