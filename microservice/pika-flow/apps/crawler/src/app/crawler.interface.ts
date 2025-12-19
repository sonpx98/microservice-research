export interface ArticleData {
    title: string;
    link: string;
    content: string;
    source: string;
    pubDate?: string;
}

export interface ICrawler {
    name: string;
    crawl(): Promise<ArticleData[]>;
}