import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Reading, ReadingSchema } from '../../common/schemas';
import { AiModule } from '../ai/ai.module';
import { ReadingController } from './reading.controller';
import { ReadingService } from './reading.service';
import { ReadingScheduler } from './reading.scheduler';

@Module({
  imports: [MongooseModule.forFeature([{ name: Reading.name, schema: ReadingSchema }]), AiModule],
  controllers: [ReadingController],
  providers: [ReadingService, ReadingScheduler],
})
export class ReadingModule {}
