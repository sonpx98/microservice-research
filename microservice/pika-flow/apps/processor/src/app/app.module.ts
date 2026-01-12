import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthController } from './health.controller';
import { News, NewsSchema } from '../../../../libs/common/src/schemas/news.schema';

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
      defaultJobOptions: {
        removeOnComplete: true,  // Auto-remove completed jobs from Redis
        removeOnFail: false,     // Keep failed jobs for debugging
        attempts: 3,             // Retry failed jobs 3 times
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
      },
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI') || 'mongodb://user:password@localhost:27017/pikaflow',
        serverApi: {
          version: '1',
          strict: true,
          deprecationErrors: true,
        },
      }),
      inject: [ConfigService],
    }),

    MongooseModule.forFeature([{ name: News.name, schema: NewsSchema }]),
  ],
  controllers: [HealthController],
  providers: [AppService, AppController],
})
export class AppModule { }