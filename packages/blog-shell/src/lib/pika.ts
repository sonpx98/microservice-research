
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

interface FetchOptions {
  maxRetries?: number;
  retryDelay?: number;
}

/**
 * Fetch with retry logic for handling cold starts and transient failures
 */
async function fetchWithRetry<T>(
  url: string,
  options: RequestInit,
  { maxRetries = 3, retryDelay = 1000 }: FetchOptions = {}
): Promise<Response | null> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);

      // Retry on 5xx errors (server issues)
      if (response.status >= 500 && attempt < maxRetries) {
        console.warn(`Attempt ${attempt}/${maxRetries} failed with ${response.status}, retrying...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
        continue;
      }

      return response;
    } catch (error) {
      lastError = error as Error;

      // Don't retry on abort
      if (error instanceof Error && error.name === 'AbortError') {
        throw error;
      }

      if (attempt < maxRetries) {
        console.warn(`Attempt ${attempt}/${maxRetries} failed:`, error);
        await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
      }
    }
  }

  console.error(`All ${maxRetries} attempts failed. Last error:`, lastError);
  return null;
}

const GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL || 'http://127.0.0.1:8080/api';

export async function getCrawledNews(
  page = 1,
  limit = 10,
  search = '',
  tag = ''
): Promise<{ items: NewsItem[], total: number, sources: number }> {
  try {
    const url = `${GATEWAY_URL}/news?page=${page}&limit=${limit}&q=${encodeURIComponent(search)}&tag=${encodeURIComponent(tag)}`;

    const res = await fetchWithRetry(url, {
      next: { revalidate: 60 },
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(60000),
    });

    if (!res) {
      console.error('Failed to fetch news after retries');
      return { items: [], total: 0, sources: 0 };
    }

    if (!res.ok) {
      console.warn(`Failed to fetch news: ${res.status} ${res.statusText}`);
      return { items: [], total: 0, sources: 0 };
    }

    const data = await res.json();

    if (data && Array.isArray(data.data)) {
      return {
        items: data.data,
        total: data.meta?.total || 0,
        sources: data.meta?.total_sources || 0
      };
    }

    return { items: [], total: 0, sources: 0 };
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('Request timed out after 60s');
    } else {
      console.error('Error fetching Pika news:', error);
    }
    return { items: [], total: 0, sources: 0 };
  }
}

export async function getAvailableTags(): Promise<string[]> {
  try {
    const res = await fetchWithRetry(`${GATEWAY_URL}/news/tags`, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(60000),
    });

    if (!res || !res.ok) return [];

    const tags = await res.json();
    return tags.filter((t: string) => t).sort();
  } catch (error) {
    console.error('Error fetching tags:', error);
    return [];
  }
}
