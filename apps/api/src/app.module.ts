import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { HealthController } from './health.controller';
import { NewsModule } from './news/news.module';
import { EnglishLearningModule } from './english-learning/english-learning.module';
import { TtsModule } from './tts/tts.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    MongooseModule.forRoot(
      process.env.MONGO_URI || 'mongodb://user:password@localhost:27017/pikaflow?authSource=admin',
    ),
    NewsModule,
    EnglishLearningModule,
    TtsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
