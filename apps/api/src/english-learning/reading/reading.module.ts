import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Reading, ReadingSchema } from '../../common/schemas';
import { ReadingController } from './reading.controller';
import { ReadingService } from './reading.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Reading.name, schema: ReadingSchema }])],
  controllers: [ReadingController],
  providers: [ReadingService],
})
export class ReadingModule {}
