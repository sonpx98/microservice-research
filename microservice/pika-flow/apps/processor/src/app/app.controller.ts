import { Logger } from '@nestjs/common';
import { Processor, Process } from '@nestjs/bull';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { News, NewsDocument } from '@app/common';
import type { Job } from 'bull';

@Processor('news-processing')
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(
    @InjectModel(News.name) private newsModel: Model<NewsDocument>
  ) { }

  @Process('process-article')
  async handleProcessArticle(job: Job) {
    const data = job.data;
    this.logger.log(`⚡️ [Processor] Nhận tin: ${data.title}`);

    try {
      await this.newsModel.findOneAndUpdate(
        { link: data.link },
        { $set: data }, // Update fields from crawler
        { upsert: true, new: true }
      );

      this.logger.log(`✅ Đã lưu/cập nhật thành công!`);
      return { success: true, title: data.title };

    } catch (error: any) {
      this.logger.error(`❌ Lỗi lưu DB:`, error);
      throw error; // Bull will retry based on job options
    }
  }
}