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
      const createdNews = new this.newsModel({
        ...data,
        tags: [],
      });

      await createdNews.save();
      console.log('✅ Đã lưu thành công!');

    } catch (error: any) {
      if (error.code === 11000) {
        console.log('⚠️ Tin này đã tồn tại (Trùng link), bỏ qua.');
      } else {
        console.error('❌ Lỗi lưu DB:', error);
      }
    }
  }
}