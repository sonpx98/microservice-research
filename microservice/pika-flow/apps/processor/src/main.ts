import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';

async function bootstrap() {
  // Change from createMicroservice to create (regular NestJS app)
  const app = await NestFactory.create(AppModule);

  await app.listen(3002); // Optional HTTP endpoint for health checks
  console.log('🤖 Processor Service running and listening to Redis queue...');
}

bootstrap();