
import { Injectable, Logger } from '@nestjs/common';
import { ICrawler, ArticleData } from '../crawler.interface';
import axios from 'axios';
import * as cheerio from 'cheerio';
import Parser from 'rss-parser';

@Injectable()
export class TechCrunchCrawler implements ICrawler {
    name = 'TechCrunch';
    private readonly logger = new Logger(TechCrunchCrawler.name);
    private readonly parser = new Parser<ArticleData>({
        customFields: {
            item: ['description'],
        },
    });

    async crawl(): Promise<ArticleData[]> {
        const RSS_URL = 'https://techcrunch.com/feed/';
        this.logger.log(`Starting crawl for ${this.name}`);

        try {
            const feed = await this.parser.parseURL(RSS_URL);
            const items = feed.items.slice(0, 5);
            const results: ArticleData[] = [];

            for (const item of items) {
                if (!item.link || !item.title) continue;

                // Note: TechCrunch RSS often contains full content or enough description
                // But let's try to fetch meta image just in case it's missing in RSS
                // RSS generic fields: item.description, item.content, item['content:encoded']
                // TechCrunch is good with content

                // Try to find image in content or enclosure
                let thumbnail = '';
                // @ts-ignore
                if (item.enclosure && item.enclosure.url) {
                    // @ts-ignore
                    thumbnail = item.enclosure.url;
                }

                const pageData = await this.fetchPageData(item.link);
                if (!thumbnail) {
                    thumbnail = pageData.thumbnail;
                }
                const tags = pageData.tags;
                const content = pageData.content;

                const finalTags = item.categories || tags;

                results.push({
                    title: item.title,
                    link: item.link,
                    content: content || item['content:encoded'] || item.content || '',
                    description: item.summary || item.description || item.content || '', // RSS description
                    source: this.name,
                    pubDate: item.pubDate ? new Date(item.pubDate) : new Date(),
                    thumbnail: thumbnail || '',
                    tags: finalTags,
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

            // Simple content extraction for TechCrunch
            $('script, style, nav, header, footer').remove();

            const content = $('.wp-block-paragraph')
                .map((_, el) => $.html(el))
                .get()
                .join('');

            return { thumbnail, tags, content };
        } catch (e) {
            return { thumbnail: '', tags: [], content: '' };
        }
    }
}
