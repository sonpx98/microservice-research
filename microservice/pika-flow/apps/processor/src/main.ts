import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://user:password@localhost:5672'],
        queue: 'news_queue',
        queueOptions: {
          durable: true,
        },
      },
    }
  );

  await app.listen();
  console.log('🤖 Processor Service đang chạy và lắng nghe RabbitMQ...');
}

bootstrap();