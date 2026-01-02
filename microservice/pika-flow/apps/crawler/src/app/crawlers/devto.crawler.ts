
import { Injectable, Logger } from '@nestjs/common';
import { ICrawler, ArticleData } from '../crawler.interface';
import axios from 'axios';
import * as cheerio from 'cheerio';
import Parser from 'rss-parser';
import { ARTICLES_PER_CRAWLER } from '../crawler.config';

@Injectable()
export class DevToCrawler implements ICrawler {
    name = 'Dev.to';
    private readonly logger = new Logger(DevToCrawler.name);
    private readonly parser = new Parser<ArticleData>({
        customFields: {
            item: ['description'],
        },
    });

    async crawl(): Promise<ArticleData[]> {
        const RSS_URL = 'https://dev.to/feed';
        this.logger.log(`Starting crawl for ${this.name}`);

        try {
            const feed = await this.parser.parseURL(RSS_URL);
            const items = feed.items.slice(0, ARTICLES_PER_CRAWLER);
            const results: ArticleData[] = [];

            for (const item of items) {
                if (!item.link || !item.title) continue;

                const { thumbnail, tags, content } = await this.fetchPageData(item.link);
                results.push({
                    title: item.title,
                    link: item.link,
                    content: content || item['content:encoded'] || item.content || '',
                    description: (item.summary || item.description || item.content || '').replace(/<[^>]*>?/gm, ''),
                    source: this.name,
                    pubDate: item.pubDate ? new Date(item.pubDate) : new Date(),
                    thumbnail,
                    tags: item.categories || tags
                });
            }
            return results;
        } catch (error: any) {
            this.logger.error(`Error crawling ${this.name}: ${error.message}`);
            return [];
        }
    }

    private async fetchPageData(url: string): Promise<{ thumbnail: string; tags: string[]; content: string }> {
        try {
            const { data } = await axios.get(url, {
                headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)' },
            });
            const $ = cheerio.load(data);
            const thumbnail = $('meta[property="og:image"]').attr('content') || '';

            const tags: string[] = [];
            $('meta[property="article:tag"]').each((_, el) => {
                const tag = $(el).attr('content');
                if (tag) tags.push(tag);
            });

            // Dev.to content is in #article-body
            $('script, style, nav, header, footer').remove();
            const content = $('#article-body').html() || '';

            return { thumbnail, tags, content };
        } catch (e) {
            return { thumbnail: '', tags: [], content: '' };
        }
    }
}
