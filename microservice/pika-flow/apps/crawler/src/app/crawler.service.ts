import { Injectable, Inject, Logger } from '@nestjs/common';
import type { ICrawler } from './crawler.interface';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';

@Injectable()
export class CrawlerService {
  private readonly logger = new Logger(CrawlerService.name);
  constructor(
    @Inject('CRAWLERS') private readonly crawlers: ICrawler[],
    @InjectQueue('news-processing') private newsQueue: Queue,
  ) { }

  async startCrawling() {
    const allArticles = [];

    for (const crawler of this.crawlers) {
      this.logger.log(`🕷️ Đang chạy crawler: ${crawler.name}...`);
      try {
        const articles = await crawler.crawl();
        this.logger.log(`✅ ${crawler.name} lấy được ${articles.length} bài.`);
        allArticles.push(...articles);
      } catch (error) {
        this.logger.error(`❌ Lỗi crawler ${crawler.name}:`, error);
      }
    }

    this.logger.log(`📦 Tổng cộng lấy được ${allArticles.length} bài. Đang đẩy vào Queue...`);

    // Add jobs to Bull queue with retry logic
    for (const article of allArticles) {
      await this.newsQueue.add('process-article', article, {
        attempts: 3, // Retry 3 times on failure
        backoff: {
          type: 'exponential',
          delay: 2000, // Start with 2s delay
        },
      });
    }

    this.logger.log(`🚀 Đã thêm ${allArticles.length} jobs vào Redis queue!`);
    return { status: 'Sent to Queue', count: allArticles.length };
  }
}
