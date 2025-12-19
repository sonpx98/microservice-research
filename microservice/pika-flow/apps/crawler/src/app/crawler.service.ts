import { Injectable, Inject, Logger } from '@nestjs/common';
import type { ICrawler } from './crawler.interface';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class CrawlerService {
    private readonly logger = new Logger(CrawlerService.name);
  constructor(
    @Inject('CRAWLERS') private readonly crawler: ICrawler,
    @Inject('RABBITMQ_SERVICE') private readonly rabbitClient: ClientProxy,
  ) {}

  async startCrawling() {
    const articles = await this.crawler.crawl();

   this.logger.log(`✅ Đã lấy được ${articles.length} bài. Bắt đầu đẩy vào Queue...`);

    for(const article of articles) {
      this.rabbitClient.emit('new_article', article);
      this.logger.log(`➡️ Đã đẩy bài "${article.title}" vào Queue.`);
    }

    this.logger.log(`🚀 Đã bắn ${articles.length} message sang RabbitMQ!`);
    return { status: 'Sent to Queue', count: articles.length };
  }
}
