import { Controller, Get, Param, Query } from '@nestjs/common';
import { EnglishLearningService } from './english-learning.service';

@Controller('readings')
export class EnglishLearningController {
    constructor(private readonly englishLearningService: EnglishLearningService) { }

    @Get()
    async getReadings(@Query() query: any) {
        return this.englishLearningService.getReadings(query);
    }

    @Get(':id')
    async getReadingById(@Param('id') id: string) {
        return this.englishLearningService.getReadingById(id);
    }
}
