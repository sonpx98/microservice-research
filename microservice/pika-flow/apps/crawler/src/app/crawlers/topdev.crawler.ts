import { Injectable, Logger } from '@nestjs/common';
import Parser from 'rss-parser';
import * as cheerio from 'cheerio';
import { ICrawler, ArticleData } from '../crawler.interface';
import axios from 'axios';
import { ARTICLES_PER_CRAWLER } from '../crawler.config';

const RSS_URL = 'https://topdev.vn/blog/feed/';

@Injectable()
export class TopDevCrawler implements ICrawler {
    private readonly logger = new Logger(TopDevCrawler.name);
    private readonly parser = new Parser({
        customFields: {
            item: ['description', 'content:encoded', 'categories'],
        },
    });

    name = 'TopDev';

    async crawl(): Promise<ArticleData[]> {
        this.logger.log(`Starting crawl for ${this.name}`);

        try {
            const feed = await this.parser.parseURL(RSS_URL);
            const items = feed.items.slice(0, ARTICLES_PER_CRAWLER);
            const results: ArticleData[] = [];

            for (const item of items) {
                if (!item.link || !item.title) continue;

                // TopDev RSS often has full content in content:encoded
                // But we like to be consistent and maybe scrape for clean HTML structure if needed.
                // Or simply rely on RSS if it's good. 
                // Let's scrape to ensure we get the thumbnail properly if not in RSS enclosures.
                const pageData = await this.fetchPageData(item.link);

                results.push({
                    title: item.title,
                    link: item.link,
                    content: pageData.content || item['content:encoded'] || item.content || '',
                    description: item.description?.replace(/<[^>]*>?/gm, '') || '',
                    source: 'TopDev',
                    pubDate: item.pubDate ? new Date(item.pubDate) : new Date(),
                    thumbnail: pageData.thumbnail,
                    tags: item.categories || pageData.tags,
                });
            }

            this.logger.log(`Crawled ${results.length} articles from ${this.name}`);
            return results;
        } catch (error) {
            this.logger.error(`Error crawling ${this.name}:`, error);
            return [];
        }
    }

    private async fetchPageData(url: string): Promise<{ thumbnail: string, tags: string[], content: string }> {
        try {
            const response = await axios.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36'
                }
            });

            const html = response.data;
            const $ = cheerio.load(html);

            const thumbnail = $('meta[property="og:image"]').attr('content') || '';

            // Standard WordPress tags
            const tags: string[] = [];
            $('.td-category a').each((_, el) => {
                tags.push($(el).text().trim());
            });

            // Content
            $('.td-post-content script, .td-post-content style, .td-post-content .td-post-sharing').remove();

            // Select the content wrapper
            let contentWrapper = $('.td-post-content');
            if (contentWrapper.length === 0) {
                $('.entry-content script, .entry-content style').remove();
                contentWrapper = $('.entry-content');
            }

            // Fix lazy loading images
            contentWrapper.find('img').each((_, el) => {
                const img = $(el);
                const dataSrc = img.attr('data-src');
                const dataLazySrc = img.attr('data-lazy-src');

                if (dataSrc) {
                    img.attr('src', dataSrc);
                } else if (dataLazySrc) {
                    img.attr('src', dataLazySrc);
                }

                // Remove lazy loading attributes and srcset to prevent browser confusion
                img.removeAttr('data-src');
                img.removeAttr('data-lazy-src');
                img.removeAttr('srcset');
                img.removeAttr('data-srcset');
                img.removeAttr('loading');
            });

            const content = contentWrapper.html() || '';

            return { thumbnail, tags, content };
        } catch (e: any) {
            this.logger.warn(`Failed to fetch page data for ${url}: ${e.message}`);
            return { thumbnail: '', tags: [], content: '' };
        }
    }
}
