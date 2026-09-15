import { Injectable, Inject, Logger } from '@nestjs/common';
import type { ICrawler, ArticleData } from './crawler.interface';
import { NewsService } from './news.service';

@Injectable()
export class CrawlerService {
  private readonly logger = new Logger(CrawlerService.name);

  constructor(
    @Inject('CRAWLERS') private readonly crawlers: ICrawler[],
    private readonly newsService: NewsService,
  ) {}

  // ponytail: sequential crawl + one bulk upsert. Bull/Redis queue removed; add back only if a crawl outgrows one request.
  async startCrawling() {
    const articles: ArticleData[] = [];

    for (const crawler of this.crawlers) {
      this.logger.log(`Crawling ${crawler.name}...`);
      try {
        const items = await crawler.crawl();
        this.logger.log(`${crawler.name}: ${items.length} articles`);
        articles.push(...items);
      } catch (error) {
        this.logger.error(`Crawler ${crawler.name} failed`, error);
      }
    }

    const saved = await this.newsService.upsertMany(articles);
    this.logger.log(`Crawl done: ${articles.length} fetched, ${saved} saved/updated`);
    return { fetched: articles.length, saved };
  }
}
