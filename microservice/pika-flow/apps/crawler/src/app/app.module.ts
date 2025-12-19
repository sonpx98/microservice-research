import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { CrawlerService } from './crawler.service';
import { VnExpressCrawler } from './crawlers/vnexpress.crawler';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'RABBITMQ_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://user:password@localhost:5672'],
          queue: 'news_queue',
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),
  ],
  controllers: [AppController],
  providers: [
    CrawlerService,
    {
      provide: 'CRAWLERS',
      useClass: VnExpressCrawler,
    },
  ],
})
export class AppModule {}
