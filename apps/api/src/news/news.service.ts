import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { News, NewsDocument } from '../common/schemas';
import type { ArticleData } from './crawler.interface';

@Injectable()
export class NewsService {
  constructor(@InjectModel(News.name) private newsModel: Model<NewsDocument>) {}

  async getNews(page: number, limit: number, search?: string, tag?: string) {
    const skip = (page - 1) * limit;
    const query: Record<string, unknown> = {};
    if (search) query.title = { $regex: search, $options: 'i' };
    if (tag) query.tags = tag;

    const [data, total, sources] = await Promise.all([
      this.newsModel.find(query).sort({ pubDate: -1 }).skip(skip).limit(limit).exec(),
      this.newsModel.countDocuments(query),
      this.newsModel.distinct('source', query).exec(),
    ]);

    return {
      data,
      meta: { total, page, last_page: Math.ceil(total / limit), total_sources: sources.length },
    };
  }

  getTags() {
    return this.newsModel.distinct('tags').exec();
  }

  getNewsById(id: string) {
    return this.newsModel.findById(id).exec();
  }

  /** Upsert by link so re-crawls refresh existing rows instead of duplicating. */
  async upsertMany(articles: ArticleData[]) {
    if (articles.length === 0) return 0;
    const result = await this.newsModel.bulkWrite(
      articles.map((a) => ({
        updateOne: { filter: { link: a.link }, update: { $set: a }, upsert: true },
      })),
    );
    return result.upsertedCount + result.modifiedCount;
  }
}
