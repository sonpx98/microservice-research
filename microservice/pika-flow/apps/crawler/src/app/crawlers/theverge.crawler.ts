
import { Injectable, Logger } from '@nestjs/common';
import { ICrawler, ArticleData } from '../crawler.interface';
import axios from 'axios';
import * as cheerio from 'cheerio';
import Parser from 'rss-parser';

@Injectable()
export class TheVergeCrawler implements ICrawler {
    name = 'TheVerge';
    private readonly logger = new Logger(TheVergeCrawler.name);
    private readonly parser = new Parser<ArticleData>({
        customFields: {
            item: ['description'],
        },
    });

    async crawl(): Promise<ArticleData[]> {
        const RSS_URL = 'https://www.theverge.com/rss/index.xml';
        this.logger.log(`Starting crawl for ${this.name}`);

        try {
            const feed = await this.parser.parseURL(RSS_URL);
            const items = feed.items.slice(0, 5);
            const results: ArticleData[] = [];

            for (const item of items) {
                if (!item.link || !item.title) continue;

                const { thumbnail, tags, content } = await this.fetchPageData(item.link);

                results.push({
                    title: item.title,
                    link: item.link,
                    content: content || item['content:encoded'] || item.content || '',
                    description: item.summary || item.description || item.content || '',
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
            $('meta[name="parsely-tags"]').each((_, el) => {
                const content = $(el).attr('content');
                if (content) {
                    const extractedTags = content.split(',')
                        .map(t => t.trim())
                        .filter(t => t && t !== 'theverge' && !t.includes(':'));
                    tags.push(...extractedTags);
                }
            });

            // TheVerge specific content extraction
            $('script, style, nav, header, footer').remove();

            const content = $('.duet--article--article-body-component, .duet--article--block-placement')
                .map((_, el) => $.html(el))
                .get()
                .join('');

            return { thumbnail, tags, content };
        } catch (e) {
            return { thumbnail: '', tags: [], content: '' };
        }
    }
}
