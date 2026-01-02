
export interface NewsItem {
  _id?: string;
  title: string;
  description?: string;
  link: string;
  pubDate?: string;
  thumbnail?: string;
  source?: string;
  tags?: string[];
}

export async function getCrawledNews(page = 1, limit = 10, search = '', tag = ''): Promise<{ items: NewsItem[], total: number, sources: number }> {
  try {
    // Gateway URL - should be in env var in production
    const GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL || 'http://127.0.0.1:3000/api';

    // Server-side fetch to local gateway with 60s timeout for cold starts
    const res = await fetch(`${GATEWAY_URL}/news?page=${page}&limit=${limit}&q=${encodeURIComponent(search)}&tag=${encodeURIComponent(tag)}`, {
      next: { revalidate: 60 },
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(60000), // 60s timeout for Render cold start
    });

    if (!res.ok) {
      console.warn(`Failed to fetch news: ${res.status} ${res.statusText}`);
      return { items: [], total: 0, sources: 0 };
    }

    const data = await res.json();

    // Handle different response structures
    if (data && Array.isArray(data.data)) {
      return {
        items: data.data,
        total: data.meta?.total || 0,
        sources: data.meta?.total_sources || 0
      };
    }

    return { items: [], total: 0, sources: 0 };
  } catch (error) {
    console.error('Error fetching Pika news:', error);
    return { items: [], total: 0, sources: 0 };
  }
}

export async function getAvailableTags(): Promise<string[]> {
  try {
    const GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL || 'http://127.0.0.1:3000/api';
    const res = await fetch(`${GATEWAY_URL}/news/tags`, {
      next: { revalidate: 3600 }, // Cache tags for 1 hour
      signal: AbortSignal.timeout(60000), // 60s timeout for Render cold start
    });

    if (!res.ok) return [];

    const tags = await res.json();
    // sort and filter empty
    return tags.filter((t: string) => t).sort();
  } catch (error) {
    console.error('Error fetching tags:', error);
    return [];
  }
}
