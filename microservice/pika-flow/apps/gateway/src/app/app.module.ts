import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { News, NewsSchema } from '@app/common';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI') || 'mongodb://user:password@localhost:27017/intelflow',
      }),
      inject: [ConfigService],
    }),

    MongooseModule.forFeature([{ name: News.name, schema: NewsSchema }]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}