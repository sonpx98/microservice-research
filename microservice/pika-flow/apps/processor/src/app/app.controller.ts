import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { News, NewsDocument } from '@app/common';

@Controller()
export class AppController {
  constructor(
    @InjectModel(News.name) private newsModel: Model<NewsDocument>
  ) {}

  @EventPattern('new_article')
  async handleNewArticle(@Payload() data: any) {
    console.log('⚡️ [Processor] Nhận tin:', data.title);


    try {
      await this.newsModel.findOneAndUpdate(
        { link: data.link },
        { $set: data }, // Update fields from crawler
        { upsert: true, new: true }
      );

      console.log('✅ Đã lưu/cập nhật thành công!');

    } catch (error: any) {
      console.error('❌ Lỗi lưu DB:', error);
    }
  }
}