import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CrawlerService } from './crawler.service';

@Injectable()
export class ScheduledCrawlerService {
    private readonly logger = new Logger(ScheduledCrawlerService.name);

    constructor(private readonly crawlerService: CrawlerService) { }

    // Mặc định chạy hàng ngày lúc 4AM UTC (11AM Vietnam)
    // Có thể thay đổi bằng env variable CRAWLER_CRON
    @Cron(process.env['CRAWLER_CRON'] || CronExpression.EVERY_DAY_AT_1AM)
    async handleCron() {
        this.logger.log('🕐 Scheduled crawl triggered');
        try {
            const result = await this.crawlerService.startCrawling();
            this.logger.log(`✅ Scheduled crawl completed: ${JSON.stringify(result)}`);
        } catch (error) {
            this.logger.error('❌ Scheduled crawl failed:', error);
        }
    }
}
