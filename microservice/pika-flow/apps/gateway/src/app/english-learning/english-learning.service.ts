import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Reading, ReadingDocument } from '@app/common';

@Injectable()
export class EnglishLearningService {
    private readonly logger = new Logger(EnglishLearningService.name);

    constructor(
        @InjectModel(Reading.name) private readingModel: Model<ReadingDocument>
    ) { }

    async getReadings(params: { q?: string; topic?: string; level?: string; page?: number; limit?: number }) {
        const page = params.page || 1;
        const limit = params.limit || 10;
        const skip = (page - 1) * limit;

        const query: any = {};
        if (params.level) query.level = params.level;
        if (params.topic) query.topic = { $regex: params.topic, $options: 'i' };
        if (params.q) {
            query.$or = [
                { title: { $regex: params.q, $options: 'i' } },
                { content: { $regex: params.q, $options: 'i' } }
            ];
        }

        this.logger.log(`Fetching readings with query: ${JSON.stringify(query)}`);

        const [data, total] = await Promise.all([
            this.readingModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
            this.readingModel.countDocuments(query).exec()
        ]);

        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        };
    }

    async getReadingById(id: string) {
        const reading = await this.readingModel.findById(id).exec();
        if (!reading) {
            throw new NotFoundException(`Reading with ID ${id} not found`);
        }
        return reading;
    }
}
