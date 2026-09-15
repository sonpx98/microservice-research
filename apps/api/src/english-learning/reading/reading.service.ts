import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Reading, ReadingDocument } from '../../common/schemas';
import { AiService } from '../ai/ai.service';

export interface GeneratedReading {
  title: string;
  content: string;
  quizzes: unknown[];
}

@Injectable()
export class ReadingService {
  private readonly logger = new Logger(ReadingService.name);

  constructor(
    @InjectModel(Reading.name) private readingModel: Model<ReadingDocument>,
    private aiService: AiService,
  ) {}

  async generateReading(level: string, topic: string) {
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

    const data = await this.aiService.generateJson<GeneratedReading>(prompt);
    return this.save({ ...data, level, topic });
  }

  save(reading: GeneratedReading & { level: string; topic: string }) {
    return new this.readingModel(reading).save();
  }

  async findAll(params: { q?: string; topic?: string; level?: string; page?: number; limit?: number }) {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = {};
    if (params.level) query.level = params.level;
    if (params.topic) query.topic = { $regex: params.topic, $options: 'i' };
    if (params.q) {
      query.$or = [
        { title: { $regex: params.q, $options: 'i' } },
        { content: { $regex: params.q, $options: 'i' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.readingModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      this.readingModel.countDocuments(query).exec(),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const reading = await this.readingModel.findById(id).exec();
    if (!reading) throw new NotFoundException(`Reading with ID ${id} not found`);
    return reading;
  }
}
