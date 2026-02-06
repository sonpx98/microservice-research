import { Module } from '@nestjs/common';
// Services and controllers will be added later
import { MongooseModule } from '@nestjs/mongoose';
import { Reading, ReadingSchema } from '../../../../../libs/common/src';
import { AiModule } from '../ai/ai.module';

import { ReadingController } from './reading.controller';
import { ReadingService } from './reading.service';

import { BullModule } from '@nestjs/bull';

import { ReadingScheduler } from './reading.scheduler';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Reading.name, schema: ReadingSchema }]),
        BullModule.registerQueue({
            name: 'english-learning',
        }),
        AiModule
    ],
    controllers: [ReadingController],
    providers: [ReadingService, ReadingScheduler],
    exports: [ReadingService]
})
export class ReadingModule { }
