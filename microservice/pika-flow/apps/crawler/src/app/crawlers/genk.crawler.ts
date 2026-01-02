import { Injectable, Logger } from '@nestjs/common';
import Parser from 'rss-parser';
import * as cheerio from 'cheerio';
import { ICrawler, ArticleData } from '../crawler.interface';
import axios from 'axios';
import { ARTICLES_PER_CRAWLER } from '../crawler.config';

const RSS_URL = 'https://genk.vn/rss/home.rss';

@Injectable()
export class GenkCrawler implements ICrawler {
    private readonly logger = new Logger(GenkCrawler.name);
    private readonly parser = new Parser({
        customFields: {
            item: ['description'],
        },
    });

    name = 'GenK';

    async crawl(): Promise<ArticleData[]> {
        this.logger.log(`Starting crawl for ${this.name}`);

        try {
            const feed = await this.parser.parseURL(RSS_URL);
            // Limit to configured number of items
            const items = feed.items.slice(0, ARTICLES_PER_CRAWLER);
            const results: ArticleData[] = [];

            for (const item of items) {
                if (!item.link || !item.title) continue;

                // GenK RSS description is often just a short snippet.
                // We'll scrape the page for full content and better metadata.
                const pageData = await this.fetchPageData(item.link);

                results.push({
                    title: item.title,
                    link: item.link,
                    content: pageData.content || item.description || '',
                    description: item.description?.replace(/<[^>]*>?/gm, '') || '', // Clean HTML tags from description
                    source: 'GenK',
                    pubDate: item.pubDate ? new Date(item.pubDate) : new Date(),
                    thumbnail: pageData.thumbnail,
                    tags: pageData.tags,
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
                responseType: 'arraybuffer',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36'
                }
            });

            // GenK might use specific encoding, but utf-8 is standard for modern sites.
            // Check headers if needed, but usually utf8.
            const html = response.data.toString('utf-8');
            const $ = cheerio.load(html);

            // Thumbnail
            let thumbnail = $('meta[property="og:image"]').attr('content') || '';

            // Tags - Try breadcrumbs
            const tags: string[] = [];
            $('.gbrcw-list li a span').each((_, el) => {
                const tag = $(el).text().trim();
                if (tag && tag !== 'Trang chủ') tags.push(tag);
            });

            // Content
            // Remove unwanted elements first
            $('.knc-content.detail-content script, .knc-content.detail-content style, .knc-content.detail-content .knc-relate-wrapper, .knc-content.detail-content .link-source-wrapper').remove();

            // Sapo (Introduction) + Content
            const sapo = $('.knc-sapo').html() || '';
            const body = $('.knc-content.detail-content').html() || '';

            // Process content to fix lazy loading images
            const contentElement = sapo || body ? $('<div>').append(sapo).append(body) : $('#ContentDetail');

            contentElement.find('img').each((_, el) => {
                const img = $(el);
                const dataOriginal = img.attr('data-original');
                const dataSrc = img.attr('data-src');

                if (dataOriginal) {
                    img.attr('src', dataOriginal);
                } else if (dataSrc) {
                    img.attr('src', dataSrc);
                }

                // Ensure src is absolute if it's relative
                const currentSrc = img.attr('src');
                if (currentSrc && currentSrc.startsWith('/')) {
                    img.attr('src', `https://genk.vn${currentSrc}`);
                }

                // Remove lazy loading attributes to avoid confusion
                img.removeAttr('data-original');
                img.removeAttr('data-src');
                img.removeAttr('loading');
            });

            let content = contentElement.html() || '';

            // Fallback if structured content is missing but #ContentDetail exists (already handled above somewhat)
            if (!content && !sapo && !body) {
                content = $('#ContentDetail').html() || '';
            }

            return { thumbnail, tags, content };
        } catch (e: any) {
            this.logger.warn(`Failed to fetch page data for ${url}: ${e.message}`);
            return { thumbnail: '', tags: [], content: '' };
        }
    }
}
