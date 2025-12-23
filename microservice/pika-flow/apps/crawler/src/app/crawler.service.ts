import { Injectable, Inject, Logger } from '@nestjs/common';
import type { ICrawler } from './crawler.interface';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class CrawlerService {
    private readonly logger = new Logger(CrawlerService.name);
  constructor(
    @Inject('CRAWLERS') private readonly crawlers: ICrawler[],
    @Inject('RABBITMQ_SERVICE') private readonly rabbitClient: ClientProxy,
  ) {}

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

    for(const article of allArticles) {
      this.rabbitClient.emit('new_article', article);
    }

    this.logger.log(`🚀 Đã bắn ${allArticles.length} message sang RabbitMQ!`);
    return { status: 'Sent to Queue', count: allArticles.length };
  }
}
