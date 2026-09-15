import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ConversationService } from './conversation.service';

@Injectable()
export class ConversationScheduler {
  private readonly logger = new Logger(ConversationScheduler.name);
  private readonly topics = ['Travel', 'Business', 'Technology', 'Health', 'Education', 'Food'];

  constructor(private readonly conversations: ConversationService) {}

  @Cron('0 0,8 * * *') // 7 AM and 3 PM Vietnam time (UTC+7)
  async handleCron() {
    const topic = this.topics[Math.floor(Math.random() * this.topics.length)];
    try {
      const saved = await this.conversations.generate(topic);
      this.logger.log(`Scheduled conversation saved: ${topic} (${saved.dialogue.length} lines)`);
    } catch (error) {
      this.logger.error(`Scheduled conversation failed for ${topic}`, error);
    }
  }
}
