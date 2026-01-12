'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { MessageSquare, Loader2 } from 'lucide-react';
import { GiscusWidget } from './giscus-widget';
import { Skeleton } from '@/components/ui/skeleton';

interface CommentSectionProps {
  locale: string;
}

// Loading skeleton component
function CommentLoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-full" />
        <div className="flex-1">
          <Skeleton className="h-4 w-1/4 mb-2" />
          <Skeleton className="h-3 w-1/6" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
        <Skeleton className="h-3 w-4/6" />
      </div>
      <Skeleton className="h-32 w-full" />
    </div>
  );
}

export function CommentSection({ locale }: CommentSectionProps) {
  const t = useTranslations('common');
  const [shouldLoad, setShouldLoad] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      {
        // Load much earlier - 500px before visible
        rootMargin: '500px',
        threshold: 0
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div 
      ref={sectionRef}
      className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800"
    >
      <h2 className="text-2xl font-bold mb-6">{t('comments')}</h2>

      {shouldLoad ? (
        <GiscusWidget locale={locale} />
      ) : (
        <CommentLoadingSkeleton />
      )}
    </div>
  );
}
