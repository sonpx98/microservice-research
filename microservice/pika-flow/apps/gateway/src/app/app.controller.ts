import { Controller, Get, Query, Param, NotFoundException } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('news')
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  async getNews(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('q') search = '',
    @Query('tag') tag = '',
  ) {
    return this.appService.getNews(Number(page), Number(limit), search, tag);
  }

  @Get('tags')
  async getTags() {
    return this.appService.getTags();
  }

  @Get(':id')
  async getNewsById(@Param('id') id: string) {
    const news = await this.appService.getNewsById(id);
    if (!news) {
      throw new NotFoundException('News not found');
    }
    return news;
  }
}