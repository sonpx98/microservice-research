import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { CrawlerService } from './crawler.service';
import { TechCrunchCrawler } from './crawlers/techcrunch.crawler';

import { DevToCrawler } from './crawlers/devto.crawler';
import { BullModule } from '@nestjs/bull';
import { GenkCrawler } from './crawlers/genk.crawler';
import { TopDevCrawler } from './crawlers/topdev.crawler';

@Module({
  imports: [
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
