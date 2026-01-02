'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { NewsItem } from '@/lib/pika';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, BookOpen, Calendar } from 'lucide-react';
import { BlogThumbnail } from './blog-thumbnail';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';

function NewsCard({ item }: { item: NewsItem }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const t = useTranslations('explore');

    const handleMouseEnter = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => setIsExpanded(true), 400); // 400ms delay before expanding
    };

    const handleMouseLeave = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => setIsExpanded(false), 200);
    };

    return (
        <div 
            className="relative h-full"
            onMouseEnter={handleMouseEnter} 
            onMouseLeave={handleMouseLeave}
        >
            {/* Base Card (Placeholder) */}
            <div className={`h-full transition-opacity duration-200 ${isExpanded ? 'opacity-0 invisible' : 'opacity-100 visible'}`}>
                <Card className="h-full flex flex-col border-gray-200 dark:border-gray-800">
                    <BlogThumbnail 
                        src={item.thumbnail} 
                        alt={item.title} 
                        className="rounded-t-xl aspect-video object-cover"
                    />
                    <CardHeader className="p-4">
                        <div className="flex justify-between items-start gap-2 mb-2">
                             <Badge variant="secondary" className="text-xs font-normal">
                                {item.source || 'Aggregated'}
                             </Badge>
                             <time className="text-xs text-gray-500 whitespace-nowrap">
                                {item.pubDate ? new Date(item.pubDate).toLocaleDateString() : 'Just now'}
                             </time>
                        </div>
                        <CardTitle className="line-clamp-2 text-base font-bold leading-tight h-[2.5rem]">
                            {item.title}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                         {item.tags && item.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-auto">
                                {item.tags.slice(0, 2).map((tag, tIdx) => (
                                    <span key={`${tag}-${tIdx}`} className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Expanded Overlay Card (Netflix Style) */}
            {isExpanded && (
                <div className="absolute top-[-10%] left-[-10%] w-[120%] z-50 animate-in fade-in zoom-in-95 duration-200">
                     <Link href={`/blog/explore/${item._id}`} className="block">
                        <Card className="shadow-2xl border-gray-200 dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-900 border-0 ring-1 ring-black/5 dark:ring-white/10">
                            {/* Cinematic Image */}
                            <div className="relative h-48 w-full">
                                <BlogThumbnail 
                                    src={item.thumbnail} 
                                    alt={item.title} 
                                    className="h-full w-full object-cover"
                                />
                                {/* Gradient Overlay */}
                                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent" />
                                
                                <div className="absolute bottom-3 left-4 right-4">
                                     <h4 className="font-bold text-lg leading-tight text-white drop-shadow-sm line-clamp-2">
                                        {item.title}
                                    </h4>
                                </div>
                            </div>

                            <div className="p-4 space-y-3">
                                {/* Buttons */}
                                <div className="flex gap-2">
                                    <Button className="w-full h-8 text-xs font-semibold gap-2" size="sm">
                                        <BookOpen className="w-3.5 h-3.5" />
                                        {t('readNow')}
                                    </Button>
                                </div>

                                {/* Meta Info */}
                                <div className="flex items-center gap-3 text-xs font-medium text-gray-500 dark:text-gray-400">
                                    <span className="text-gray-900 dark:text-gray-200">{item.source}</span>
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {item.pubDate ? new Date(item.pubDate).getFullYear() : '2025'}
                                    </span>
                                </div>

                                {/* Tags */}
                                {item.tags && item.tags.length > 0 && (
                                     <div className="flex flex-wrap gap-1.5">
                                        {item.tags.slice(0, 3).map((tag, tIdx) => (
                                            <span key={`${tag}-${tIdx}`} className="text-xs text-gray-500 dark:text-gray-400">
                                                {tIdx > 0 && '•'} {tag}
                                            </span>
                                        ))}
                                    </div>
                                )}
                                
                                {/* Description */}
                                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-3 leading-relaxed">
                                      {(item.description || '').replace(/<[^>]*>?/gm, '')}
                                </p>
                            </div>
                        </Card>
                     </Link>
                </div>
            )}
        </div>
    );
}

export function NewsList({ news: initialNews, initialTotal = 0 }: { news: NewsItem[], initialTotal?: number }) {
  const searchParams = useSearchParams();
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

        const GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL || 'http://127.0.0.1:3000/api';
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
      <div className="text-center py-20">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
          <ExternalLink className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{t('noNewsFound')}</h3>
        <p className="text-base text-gray-500 dark:text-gray-400 mt-2 max-w-md mx-auto">
          {t('noNewsDescription')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {news.map((item, idx) => (
                <NewsCard key={`${item._id}-${idx}`} item={item} />
            ))}
        </div>

        {/* Load More Button */}
        {hasMore && (
            <div className="flex justify-center pt-4">
                <button
                    onClick={loadMore}
                    disabled={loading}
                    className="px-6 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {loading ? (
                        <>
                            <div className="w-4 h-4 border-2 border-gray-400 border-t-blue-600 rounded-full animate-spin"></div>
                            {t('loading')}
                        </>
                    ) : (
                        t('loadMore')
                    )}
                </button>
            </div>
        )}
    </div>
  );
}
