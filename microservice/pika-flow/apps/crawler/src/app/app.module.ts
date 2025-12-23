import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { CrawlerService } from './crawler.service';
import { TechCrunchCrawler } from './crawlers/techcrunch.crawler';

import { DevToCrawler } from './crawlers/devto.crawler';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { GenkCrawler } from './crawlers/genk.crawler';
import { TopDevCrawler } from './crawlers/topdev.crawler';

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
    TechCrunchCrawler,
    DevToCrawler,
    GenkCrawler,
    TopDevCrawler,
    {
      provide: 'CRAWLERS',
      useFactory: (
        tc: TechCrunchCrawler,
        dev: DevToCrawler,
        genk: GenkCrawler,
        topdev: TopDevCrawler,
      ) => [tc, dev, genk, topdev],
      inject: [
        TechCrunchCrawler,
        DevToCrawler,
        GenkCrawler,
        TopDevCrawler,
      ],
    },
  ],
})
export class AppModule { }
