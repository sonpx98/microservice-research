import { Controller, Get, Post, Body, Param, Query, UseGuards, BadRequestException } from '@nestjs/common';
import { ReadingService, CreateReadingDto } from './reading.service';
import { ApiKeyGuard } from '../../common/api-key.guard';

@Controller('readings')
export class ReadingController {
  constructor(private readonly readingService: ReadingService) {}

  /** Content is produced outside this API (e.g. a local LLM via MCP) and pushed here. */
  @Post()
  @UseGuards(ApiKeyGuard)
  create(@Body() body: CreateReadingDto) {
    if (!body?.title || !body.content || !body.level || !body.topic) {
      throw new BadRequestException('title, content, level, topic are required');
    }
    return this.readingService.create(body);
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
