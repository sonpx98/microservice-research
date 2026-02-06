import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import type { Job } from 'bull';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Reading, ReadingDocument } from '../../../../../libs/common/src/schemas/reading.schema';

@Processor('english-learning')
export class EnglishLearningProcessor {
    private readonly logger = new Logger(EnglishLearningProcessor.name);

    constructor(
        @InjectModel(Reading.name) private readingModel: Model<ReadingDocument>,
    ) { }

    @Process()
    async handleJob(job: Job<Reading>) {
        this.logger.log(`Processing English Learning job: ${job.id}`);
        const readingData = job.data;

        try {
            // Validation (Basic check)
            if (!readingData.title || !readingData.content || !readingData.level) {
                throw new Error('Invalid reading data structure');
            }

            // Save to DB
            // Check duplication by title? Or just insert new. 
            // Scheduler generates new content, so likely new.
            const newReading = new this.readingModel({
                ...readingData,
                // Ensure quizzes are correctly formatted if necessary, but Mongoose Validates
            });

            await newReading.save();
            this.logger.log(`Successfully saved reading: ${readingData.title} (${readingData.level})`);

        } catch (error) {
            this.logger.error(`Failed to process reading job ${job.id}`, error);
            throw error; // Let Bull handle refries
        }
    }
}
