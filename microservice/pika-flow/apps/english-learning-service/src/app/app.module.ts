import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ReadingModule } from './reading/reading.module';
import { QuizModule } from './quiz/quiz.module';
import { AiModule } from './ai/ai.module';
import { BullModule } from '@nestjs/bull';
import { ScheduleModule } from '@nestjs/schedule';
import { ConversationModule } from './conversation/conversation.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
      }),
      inject: [ConfigService],
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.get('REDIS_HOST') || 'localhost',
          port: parseInt(configService.get('REDIS_PORT') || '6379'),
          password: configService.get('REDIS_PASSWORD'),
          tls: configService.get('REDIS_TLS') === 'true' ? {} : undefined,
        },
      }),
      inject: [ConfigService],
    }),
    ReadingModule,
    QuizModule,
    AiModule,
    ConversationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
