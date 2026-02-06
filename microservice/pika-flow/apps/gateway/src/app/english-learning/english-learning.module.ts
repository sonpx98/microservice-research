import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Reading, ReadingSchema } from '@app/common';
import { EnglishLearningController } from './english-learning.controller';
import { EnglishLearningService } from './english-learning.service';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Reading.name, schema: ReadingSchema }])
    ],
    controllers: [EnglishLearningController],
    providers: [EnglishLearningService],
})
export class EnglishLearningModule { }
