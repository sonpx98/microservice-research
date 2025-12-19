import { Injectable, Logger } from '@nestjs/common';
import { ICrawler, ArticleData } from '../crawler.interface';

import axios from 'axios';
import * as cheerio from 'cheerio';
import Parser from 'rss-parser';

@Injectable()
export class VnExpressCrawler implements ICrawler {
  name = 'VNEXPRESS';
  private readonly logger = new Logger(VnExpressCrawler.name);
  private readonly parser = new Parser<ArticleData>();

  async crawl(): Promise<ArticleData[]> {
    const RSS_URL = 'https://vnexpress.net/rss/tin-moi-nhat.rss';

    this.logger.log(`Starting crawl for ${this.name} from ${RSS_URL}`);

    try {
      const feed = await this.parser.parseURL(RSS_URL);
      const topArticles = feed.items.slice(0, 5);
      const results: ArticleData[] = [];
      this.logger.log(
        `Crawled ${topArticles.length} articles from ${this.name}`,
      );

      for (const item of topArticles) {
        if (!item.link || !item.title) {
          continue;
        }

        const content = await this.fetchContent(item.link);

        results.push({
          title: item.title,
          link: item.link,
          content: content,
          source: this.name,
          pubDate: item.pubDate,
        });
      }

      return results;
    } catch (error: { message?: string } | any) {
      this.logger.error(`Lỗi cào ${this.name}: ${error?.message || 'Unknown error'}`);
      return [];
    }
  }

  private async fetchContent(url: string): Promise<string> {
    try {
      const { data } = await axios.get(url, {
        headers: { 'User-Agent': 'Mozilla/5.0...' },
      });
      const $ = cheerio.load(data);

      $('.fck_detail table, .fck_detail .box-tinlienquan').remove();
      return $('.fck_detail').text().trim().replace(/\s+/g, ' ');
    } catch (e) {
      return '';
    }
  }
}
