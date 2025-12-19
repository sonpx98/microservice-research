import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('news')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async getNews(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('q') search = '',
  ) {
    return this.appService.getNews(Number(page), Number(limit), search);
  }
}