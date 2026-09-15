import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { News, NewsSchema } from '../common/schemas';
import { NewsController } from './news.controller';
import { NewsService } from './news.service';
import { CrawlerService } from './crawler.service';
import { ScheduledCrawlerService } from './scheduled-crawler.service';
import { TechCrunchCrawler } from './crawlers/techcrunch.crawler';
import { DevToCrawler } from './crawlers/devto.crawler';
import { GenkCrawler } from './crawlers/genk.crawler';
import { TopDevCrawler } from './crawlers/topdev.crawler';

const CRAWLER_CLASSES = [TechCrunchCrawler, DevToCrawler, GenkCrawler, TopDevCrawler];

@Module({
  imports: [MongooseModule.forFeature([{ name: News.name, schema: NewsSchema }])],
  controllers: [NewsController],
  providers: [
    NewsService,
    CrawlerService,
    ScheduledCrawlerService,
    ...CRAWLER_CLASSES,
    {
      provide: 'CRAWLERS',
      useFactory: (...crawlers: unknown[]) => crawlers,
      inject: CRAWLER_CLASSES,
    },
  ],
})
export class NewsModule {}
