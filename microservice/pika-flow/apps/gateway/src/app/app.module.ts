import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthController } from './health.controller';
import { News, NewsSchema } from '@app/common';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI') || 'mongodb://user:password@localhost:27017/pikaflow',
      }),
      inject: [ConfigService],
    }),

    MongooseModule.forFeature([{ name: News.name, schema: NewsSchema }]),
  ],
  controllers: [AppController, HealthController],
  providers: [AppService],
})
export class AppModule { }