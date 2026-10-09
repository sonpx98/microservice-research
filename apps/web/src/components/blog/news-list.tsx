'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { NewsItem } from '@/lib/pika';
import { ExternalLink } from 'lucide-react';
import { ContentCard } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { useTranslations } from 'next-intl';

function NewsCard({ item, locale }: { item: NewsItem; locale: string }) {
  return (
    <ContentCard
      href={`/${locale}/blog/explore/${item._id}`}
      title={item.title}
      eyebrow={item.source || 'Aggregated'}
      image={item.thumbnail}
      date={item.pubDate ? new Date(item.pubDate).toLocaleDateString(locale) : undefined}
      excerpt={(item.description || '').replace(/<[^>]*>?/gm, '')}
      tags={item.tags}
    />
  );
}

export function NewsList({ news: initialNews, initialTotal = 0 }: { news: NewsItem[], initialTotal?: number }) {
  const searchParams = useSearchParams();
  const { locale } = useParams<{ locale: string }>();
  const [news, setNews] = useState<NewsItem[]>(initialNews);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialNews.length < initialTotal);
  const t = useTranslations('explore');
  const LIMIT = 6;

  // Sync state when initialNews/search changes
  useEffect(() => {
    setNews(initialNews);
    setPage(1);
    setHasMore(initialNews.length < initialTotal);
  }, [initialNews, initialTotal]);
  
  const loadMore = async () => {
    if (loading) return;
    setLoading(true);
    try {
        const nextPage = page + 1;
        const q = searchParams.get('q') || '';
        const tag = searchParams.get('tag') || '';
        
        const params = new URLSearchParams({
            page: nextPage.toString(),
            limit: LIMIT.toString(),
            q: q,
            tag: tag
        });

        const GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL || 'http://localhost:3000/api';
        const res = await fetch(`${GATEWAY_URL}/news?${params.toString()}`, {
            signal: AbortSignal.timeout(60000), // 60s timeout for Render cold start
        });
        
        if (!res.ok) throw new Error('Failed to fetch');
        
        const data = await res.json();
        const newItems = data.data || []; 
        
        if (newItems.length < LIMIT) {
            setHasMore(false);
        }
        
        if (newItems.length > 0) {
            setNews(prev => [...prev, ...newItems]);
            setPage(nextPage);
        } else {
            setHasMore(false);
        }
    } catch (err) {
        console.error("Failed to load more news", err);
    } finally {
        setLoading(false);
    }
  };

  if (!news || news.length === 0) {
    return (
      <EmptyState
        icon={ExternalLink}
        title={t('noNewsFound')}
        description={t('noNewsDescription')}
        className="py-20"
      />
    );
  }

  return (
    <div className="space-y-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {news.map((item, idx) => (
                <NewsCard key={`${item._id}-${idx}`} item={item} locale={locale} />
            ))}
        </div>

        {/* Load More Button */}
        {hasMore && (
            <div className="flex justify-center pt-4">
                <Button onClick={loadMore} disabled={loading} variant="outline">
                    {loading ? (
                        <>
                            <LoadingSpinner size="sm" />
                            {t('loading')}
                        </>
                    ) : (
                        t('loadMore')
                    )}
                </Button>
            </div>
        )}
    </div>
  );
}
