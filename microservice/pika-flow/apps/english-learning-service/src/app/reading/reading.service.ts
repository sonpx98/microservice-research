import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Reading, ReadingDocument } from '../../../../../libs/common/src';
import { AiService } from '../ai/ai.service';

@Injectable()
export class ReadingService {
    private readonly logger = new Logger(ReadingService.name);

    constructor(
        @InjectModel(Reading.name) private readingModel: Model<ReadingDocument>,
        private aiService: AiService
    ) { }

    async generateReading(level: string, topic: string): Promise<Reading> {
        this.logger.log(`Generating reading for level ${level} and topic ${topic}`);

        const prompt = `
      Create an English reading passage about "${topic}" suitable for CEFR level ${level}.
      Include 3-5 multiple choice comprehension questions.
      
      Return valid JSON with this structure:
      {
        "title": "Title of the passage",
        "content": "The full text content...",
        "quizzes": [
          {
            "question": "Question text?",
            "options": [
              { "answer": "Option A", "isCorrect": false },
              { "answer": "Option B", "isCorrect": true },
              { "answer": "Option C", "isCorrect": false },
              { "answer": "Option D", "isCorrect": false }
            ],
            "explanation": "Why the answer is correct."
          }
        ]
      }
    `;

        try {
            interface GeneratedReading {
                title: string;
                content: string;
                quizzes: any[];
            }

            const data = await this.aiService.generateJson<GeneratedReading>(prompt);

            const newReading = new this.readingModel({
                ...data,
                level,
                topic
            });

            return await newReading.save();
        } catch (error) {
            this.logger.error('Failed to generate reading', error);
            throw error;
        }
    }

    async findAll(level?: string, topic?: string, q?: string): Promise<Reading[]> {
        const query: any = {};
        if (level) query.level = level;
        if (topic) query.topic = { $regex: topic, $options: 'i' };
        if (q) {
            query.$or = [
                { title: { $regex: q, $options: 'i' } },
                { content: { $regex: q, $options: 'i' } }
            ];
        }
        return this.readingModel.find(query).sort({ createdAt: -1 }).exec();
    }

    async findOne(id: string): Promise<Reading> {
        const reading = await this.readingModel.findById(id).exec();
        if (!reading) {
            throw new NotFoundException(`Reading with ID ${id} not found`);
        }
        return reading;
    }
}
