import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthController } from './health.controller';
import { News, NewsSchema } from '../../../../libs/common/src/schemas/news.schema';
import { Reading, ReadingSchema } from '../../../../libs/common/src/schemas/reading.schema';
import { Conversation, ConversationSchema } from '../../../../libs/common/src/schemas/conversation.schema';
import { EnglishLearningProcessor } from './processors/english-learning.processor';
import { ConversationConsumer } from './consumers/conversation.consumer';

@Module({
  imports: [
    ConfigModule.forRoot(),

    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
        tls: process.env.REDIS_TLS === 'true' ? {} : undefined,
      },
    }),
    BullModule.registerQueue({
      name: 'news-processing',
      defaultJobOptions: { removeOnComplete: true, attempts: 3, backoff: { type: 'exponential', delay: 1000 } },
    }),
    BullModule.registerQueue({
      name: 'english-learning',
      defaultJobOptions: { removeOnComplete: true, attempts: 3 },
    }),
    BullModule.registerQueue({
      name: 'conversation_queue',
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI') || 'mongodb://user:password@localhost:27017/pikaflow',
        serverApi: { version: '1', strict: true, deprecationErrors: true },
      }),
      inject: [ConfigService],
    }),

    MongooseModule.forFeature([
      { name: News.name, schema: NewsSchema },
      { name: Reading.name, schema: ReadingSchema },
      { name: Conversation.name, schema: ConversationSchema }
    ]),
  ],
  controllers: [HealthController],
  providers: [AppService, AppController, EnglishLearningProcessor, ConversationConsumer],
})
export class AppModule { }