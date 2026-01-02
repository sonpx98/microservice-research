import { Injectable, Inject, Logger } from '@nestjs/common';
import type { ICrawler } from './crawler.interface';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { BATCH_SIZE, BATCH_DELAY_MS } from './crawler.config';

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

    this.logger.log(`📦 Tổng cộng lấy được ${allArticles.length} bài. Đang đẩy vào Queue theo batch...`);

    // Add jobs to Bull queue in batches to avoid overwhelming Redis
    const totalBatches = Math.ceil(allArticles.length / BATCH_SIZE);
    let jobsAdded = 0;

    for (let i = 0; i < allArticles.length; i += BATCH_SIZE) {
      const batch = allArticles.slice(i, i + BATCH_SIZE);
      const currentBatch = Math.floor(i / BATCH_SIZE) + 1;

      this.logger.log(`📤 Batch ${currentBatch}/${totalBatches}: Đang thêm ${batch.length} jobs...`);

      // Add all jobs in current batch
      for (const article of batch) {
        await this.newsQueue.add('process-article', article, {
          attempts: 3, // Retry 3 times on failure
          backoff: {
            type: 'exponential',
            delay: 2000, // Start with 2s delay
          },
        });
        jobsAdded++;
      }

      this.logger.log(`✅ Batch ${currentBatch}/${totalBatches}: Đã thêm ${batch.length} jobs (Tổng: ${jobsAdded}/${allArticles.length})`);

      // Add delay between batches (except for the last batch)
      if (i + BATCH_SIZE < allArticles.length) {
        await new Promise(resolve => setTimeout(resolve, BATCH_DELAY_MS));
      }
    }

    this.logger.log(`🚀 Hoàn tất! Đã thêm ${jobsAdded} jobs vào Redis queue!`);
    return { status: 'Sent to Queue', count: jobsAdded, batches: totalBatches };
  }
}
