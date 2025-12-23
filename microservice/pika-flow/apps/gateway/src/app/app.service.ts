import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { News, NewsDocument } from '@app/common';

@Injectable()
export class AppService {
  constructor(@InjectModel(News.name) private newsModel: Model<NewsDocument>) { }

  async getNews(page: number, limit: number, search?: string, tag?: string) {
    const skip = (page - 1) * limit;

    const query: any = {};

    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    if (tag) {
      query.tags = tag;
    }

    const [data, total, sources] = await Promise.all([
      this.newsModel.find(query)
        .sort({ pubDate: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.newsModel.countDocuments(query),
      this.newsModel.distinct('source', query).exec(),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        last_page: Math.ceil(total / limit),
        total_sources: sources.length,
      },
    };
  }

  async getTags() {
    return this.newsModel.distinct('tags').exec();
  }

  async getNewsById(id: string) {
    return this.newsModel.findById(id).exec();
  }
}