import { Controller, Get, UseGuards } from '@nestjs/common';
import { CrawlerService } from './crawler.service';
import { ApiKeyGuard } from './guards/api-key.guard';

@Controller()
export class AppController {
  constructor(private readonly crawlerService: CrawlerService) { }

  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      service: 'crawler',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  @Get('start')
  @UseGuards(ApiKeyGuard)
  async startCrawl() {
    const result = await this.crawlerService.startCrawling();

    return {
      message: 'Crawl success',
      data: result
    };
  }
}