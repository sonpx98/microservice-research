export interface ArticleData {
    title: string;
    link: string;
    content: string;
    description?: string;
    source: string;
    pubDate?: Date;
    thumbnail?: string;
    tags?: string[];
}

export interface ICrawler {
    name: string;
    crawl(): Promise<ArticleData[]>;
}
/** Articles to fetch per source per run. */
export const ARTICLES_PER_CRAWLER = 50;
