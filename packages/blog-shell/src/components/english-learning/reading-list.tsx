'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { BookOpen, BarChart, ExternalLink } from 'lucide-react';
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

        const res = await fetch(`http://localhost:8080/api/readings?${params.toString()}`);
        
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
    return (
      <div className="text-center py-20 bg-slate-50 dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
         <p className="text-slate-500">No readings found matching filters.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {readings.map((reading) => (
            <Link 
                href={`/english-learning/${reading._id}`} 
                key={reading._id}
                className="group relative block p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1"
            >
                <div className="flex justify-between items-start mb-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300`}>
                    Level {reading.level}
                </span>
                <span className="text-slate-400 group-hover:text-blue-500 transition-colors">
                    <BookOpen className="w-5 h-5" />
                </span>
                </div>
                
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {reading.title}
                </h3>
                
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 line-clamp-3">
                {reading.topic}
                </p>
                
                <div className="flex items-center text-sm text-slate-500 dark:text-slate-500">
                    <BarChart className="w-4 h-4 mr-1.5" />
                    {reading.quizzes?.length || 0} Questions
                </div>
            </Link>
            ))}
        </div>

        {/* Load More Button */}
        {hasMore && (
            <div className="flex justify-center pt-4">
                <Button
                    onClick={loadMore}
                    disabled={loading}
                    variant="outline"
                    className="rounded-full"
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
