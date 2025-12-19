import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { News, NewsDocument } from '@app/common';

@Injectable()
export class AppService {
  constructor(@InjectModel(News.name) private newsModel: Model<NewsDocument>) {}

  async getNews(page: number, limit: number, search?: string) {
    const skip = (page - 1) * limit;

    const query = search 
      ? { title: { $regex: search, $options: 'i' } }
      : {};

    const [data, total] = await Promise.all([
      this.newsModel.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.newsModel.countDocuments(query),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        last_page: Math.ceil(total / limit),
      },
    };
  }
}