/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule as GatewayModule } from '../../gateway/src/app/app.module';
import { AppModule as CrawlerModule } from '../../crawler/src/app/app.module';
import { AppModule as ProcessorModule } from '../../processor/src/app/app.module';
import { AppModule as EnglishLearningModule } from '../../english-learning-service/src/app/app.module';
import { AppModule as TtsModule } from '../../tts-service/src/app/app.module';

async function bootstrap() {
  const logger = new Logger('Monolith');

  // Gateway
  const gatewayApp = await NestFactory.create(GatewayModule);
  gatewayApp.setGlobalPrefix('api');
  gatewayApp.enableCors();
  const gatewayPort = process.env.GATEWAY_PORT || 3000;
  await gatewayApp.listen(gatewayPort);
  logger.log(`🚀 Gateway running on: http://localhost:${gatewayPort}/api`);

  // Crawler
  const crawlerApp = await NestFactory.create(CrawlerModule);
  crawlerApp.setGlobalPrefix('api');
  const crawlerPort = process.env.CRAWLER_PORT || 3001;
  await crawlerApp.listen(crawlerPort);
  logger.log(`🚀 Crawler running on: http://localhost:${crawlerPort}/api`);

  // Processor
  const processorApp = await NestFactory.create(ProcessorModule);
  processorApp.setGlobalPrefix('api');
  const processorPort = process.env.PROCESSOR_PORT || 3002;
  await processorApp.listen(processorPort);
  logger.log(`🤖 Processor running on: http://localhost:${processorPort}/api`);

  // English Learning Service
  const englishApp = await NestFactory.create(EnglishLearningModule);
  englishApp.setGlobalPrefix('api');
  const englishPort = process.env.ENGLISH_LEARNING_PORT || 3003;
  await englishApp.listen(englishPort);
  logger.log(`📚 English Learning Service running on: http://localhost:${englishPort}/api`);

  // TTS Service
  const ttsApp = await NestFactory.create(TtsModule);
  ttsApp.setGlobalPrefix('api');
  const ttsPort = process.env.TTS_PORT || 3333;
  await ttsApp.listen(ttsPort);
  logger.log(`🗣️ TTS Service running on: http://localhost:${ttsPort}/api`);
}

bootstrap();
