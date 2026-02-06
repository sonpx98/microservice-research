import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectQueue } from '@nestjs/bull';
import bull from 'bull';
import { AiService } from '../ai/ai.service';

interface GeneratedReading {
    title: string;
    content: string;
    quizzes: any[];
}

@Injectable()
export class ReadingScheduler {
    private readonly logger = new Logger(ReadingScheduler.name);
    private readonly levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    private readonly topics = ['Technology', 'Science', 'Culture', 'History', 'Nature', 'Health'];

    constructor(
        @InjectQueue('english-learning') private englishLearningQueue: bull.Queue,
        private aiService: AiService
    ) { }



    @Cron('0 2,10 * * *') // 9 AM and 5 PM Vietnam time (UTC+7)
    async handleCron() {
        this.logger.log('Running automated reading generation job...');

        // Randomly pick 2 levels to avoid hitting rate limits hard if running often
        // Or loop all if quotas allow. Plan said loop A1-C2. Let's do batch of 2-3 per run to be safe?
        // User asked: "Mỗi batch sẽ là 5 bài từ A1 đến c2".
        // Let's iterate all levels as requested.

        for (const level of this.levels) {
            const topic = this.topics[Math.floor(Math.random() * this.topics.length)];

            try {
                let minWords = 150;
                let maxWords = 300;

                if (['B1', 'B2'].includes(level)) {
                    minWords = 350;
                    maxWords = 600;
                } else if (['C1', 'C2'].includes(level)) {
                    minWords = 600;
                    maxWords = 1000;
                }

                this.logger.log(`Generating reading for Level ${level} - Topic: ${topic} (Target: ${minWords}-${maxWords} words)`);

                let attempts = 0;
                let validParams = false;
                let generatedData: GeneratedReading | null = null;

                while (!validParams && attempts < 3) {
                    attempts++;
                    let paragraphCount = '3-5';
                    if (['C1', 'C2'].includes(level)) {
                        paragraphCount = '6-10';
                    }

                    const prompt = `
                        Create an COMPREHENSIVE and IN-DEPTH English reading passage about "${topic}" suitable for CEFR level ${level}.
                        
                        CRITICAL REQUIREMENT: The text content MUST be at least ${minWords} words long and at most ${maxWords} words. This is a strict constraint.
                        
                        CONTENT GUIDELINES:
                        - For C1/C2: Explore the topic with high complexity, nuance, and academic depth. elaborate significantly on each point.
                        - For B1/B2: Provide clear explanations with moderate detail.
                        - Do not output short summaries. Write a full, detailed article.
                        
                        FORMATTING REQUIREMENT: Structure the content into ${paragraphCount} distinct paragraphs. Use double line breaks (\n\n) to separate them clearly.
                        
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
                        generatedData = await this.aiService.generateJson<GeneratedReading>(prompt);

                        const wordCount = generatedData.content.trim().split(/\s+/).length;
                        this.logger.log(`Generated ${wordCount} words for ${level} (Attempt ${attempts})`);

                        if (wordCount >= minWords * 0.9) { // Allow 10% margin
                            validParams = true;
                        } else {
                            this.logger.warn(`Content too short (${wordCount} words < ${minWords}). Retrying...`);
                        }
                    } catch (e) {
                        this.logger.error(`Generation attempt ${attempts} failed`, e);
                    }
                }

                if (!validParams || !generatedData) {
                    this.logger.error(`Failed to generate valid reading for ${level} after ${attempts} attempts`);
                    continue; // Skip to next level
                }

                // Construct full Reading object (without _id, mongo will add it)
                const readingPayload = {
                    ...generatedData,
                    level,
                    topic,
                    // generatedAt: new Date() // Schema timestamps handles createdAt
                };

                // Push to Redis Queue
                await this.englishLearningQueue.add(readingPayload, {
                    attempts: 3,
                    backoff: 5000,
                    removeOnComplete: true
                });

                this.logger.log(`Queued reading generation for ${level}: ${generatedData.title}`);

            } catch (error) {
                this.logger.error(`Failed to generate/queue reading for ${level}`, error);
            }
        }
    }
}
