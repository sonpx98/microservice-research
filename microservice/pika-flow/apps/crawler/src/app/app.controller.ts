import { Controller, Get } from '@nestjs/common';
import { CrawlerService } from './crawler.service';

@Controller()
export class AppController {
  constructor(private readonly crawlerService: CrawlerService) {}

  @Get('start')
  async startCrawl() {
    const result = await this.crawlerService.startCrawling();
    
    return {
      message: 'Crawl success',
      data: result
    };
  }
}