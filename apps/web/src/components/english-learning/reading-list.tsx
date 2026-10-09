'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { BookOpen } from 'lucide-react';
import { ContentCard } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { EmptyState } from '@/components/ui/empty-state';

interface Reading {
    _id: string;
    title: string;
    topic: string;
    level: string;
    quizzes?: any[];
}

export function ReadingList({ readings: initialReadings, initialTotal = 0 }: { readings: Reading[], initialTotal?: number }) {
  const searchParams = useSearchParams();
  const { locale } = useParams<{ locale: string }>();
  const [readings, setReadings] = useState<Reading[]>(initialReadings);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialReadings.length < initialTotal);
  const LIMIT = 6;

  // Sync state when initialReadings changes (e.g. filter change triggers server re-render)
  useEffect(() => {
    setReadings(initialReadings);
    setPage(1);
    setHasMore(initialReadings.length < initialTotal);
  }, [initialReadings, initialTotal]);
  
  const loadMore = async () => {
    if (loading) return;
    setLoading(true);
    try {
        const nextPage = page + 1;
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', nextPage.toString());
        params.set('limit', LIMIT.toString());

        const res = await fetch(`${process.env.NEXT_PUBLIC_GATEWAY_URL || 'http://localhost:3000/api'}/readings?${params.toString()}`);
        
        if (!res.ok) throw new Error('Failed to fetch');
        
        const data = await res.json();
        // API returns { data: [], total: ..., page: ..., ... }
        const newItems = data.data || []; 
        
        if (newItems.length < LIMIT) {
            setHasMore(false);
        }
        
        if (newItems.length > 0) {
            setReadings(prev => {
                const existingIds = new Set(prev.map(item => item._id));
                const uniqueNewItems = newItems.filter((item: Reading) => !existingIds.has(item._id));
                return [...prev, ...uniqueNewItems];
            });
            setPage(nextPage);
        } else {
            setHasMore(false);
        }
    } catch (err) {
        console.error("Failed to load more readings", err);
    } finally {
        setLoading(false);
    }
  };

  if (!readings || readings.length === 0) {
    return <EmptyState icon={BookOpen} title="No readings found" description="Try another topic, level or search." />;
  }

  return (
    <div className="space-y-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {readings.map((reading) => (
            <ContentCard
              key={reading._id}
              href={`/${locale}/english-learning/${reading._id}`}
              media={false}
              eyebrow={`Level ${reading.level}`}
              title={reading.title}
              excerpt={reading.topic}
              date={`${reading.quizzes?.length || 0} questions`}
            />
          ))}
        </div>

        {/* Load More Button */}
        {hasMore && (
            <div className="flex justify-center pt-4">
                <Button
                    onClick={loadMore}
                    disabled={loading}
                    variant="outline"
                >
                    {loading ? (
                        <>
                            <LoadingSpinner size="sm" />
                            Loading...
                        </>
                    ) : (
                        "Load More"
                    )}
                </Button>
            </div>
        )}
    </div>
  );
}
