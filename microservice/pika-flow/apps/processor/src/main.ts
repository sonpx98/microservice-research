import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';

async function bootstrap() {
  // Change from createMicroservice to create (regular NestJS app)
  const app = await NestFactory.create(AppModule);

  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  const port = process.env.PROCESSOR_PORT || 3002;
  await app.listen(port);

  Logger.log(`🤖 Processor Service running on: http://localhost:${port}/${globalPrefix}`);
  Logger.log('📡 Listening to Redis queue for news processing...');
}

bootstrap();