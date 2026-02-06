import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ReadingService } from './reading.service';

@Controller('readings')
export class ReadingController {
    constructor(private readonly readingService: ReadingService) { }

    @Post('generate')
    async generate(@Body() body: { level: string; topic: string }) {
        return this.readingService.generateReading(body.level, body.topic);
    }

    @Get()
    async findAll(
        @Query('level') level?: string,
        @Query('topic') topic?: string,
        @Query('q') q?: string
    ) {
        return this.readingService.findAll(level, topic, q);
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.readingService.findOne(id);
    }
}
