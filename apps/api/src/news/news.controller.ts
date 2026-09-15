import { Controller, Get, Post, Query, Param, NotFoundException, UseGuards } from '@nestjs/common';
import { NewsService } from './news.service';
import { CrawlerService } from './crawler.service';
import { ApiKeyGuard } from '../common/api-key.guard';

@Controller('news')
export class NewsController {
  constructor(
    private readonly newsService: NewsService,
    private readonly crawlerService: CrawlerService,
  ) {}

  @Get()
  getNews(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('q') search = '',
    @Query('tag') tag = '',
  ) {
    return this.newsService.getNews(Number(page), Number(limit), search, tag);
  }

  @Get('tags')
  getTags() {
    return this.newsService.getTags();
  }

  @Post('crawl')
  @UseGuards(ApiKeyGuard)
  crawl() {
    return this.crawlerService.startCrawling();
  }

  @Get(':id')
  async getNewsById(@Param('id') id: string) {
    const news = await this.newsService.getNewsById(id);
    if (!news) throw new NotFoundException('News not found');
    return news;
  }
}
