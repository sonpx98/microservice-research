import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ReadingService } from './reading.service';
import { ApiKeyGuard } from '../../common/api-key.guard';

@Controller('readings')
export class ReadingController {
  constructor(private readonly readingService: ReadingService) {}

  @Post('generate')
  @UseGuards(ApiKeyGuard)
  generate(@Body() body: { level: string; topic: string }) {
    return this.readingService.generateReading(body.level, body.topic);
  }

  @Get()
  findAll(
    @Query('level') level?: string,
    @Query('topic') topic?: string,
    @Query('q') q?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.readingService.findAll({ level, topic, q, page: Number(page), limit: Number(limit) });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.readingService.findOne(id);
  }
}
