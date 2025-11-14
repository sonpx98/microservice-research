'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import { MessageSquare, Loader2 } from 'lucide-react';

// Lazy load Giscus component - only when user scrolls to comments
// MOCK VERSION: For testing lazy loading without GitHub setup
// To use real Giscus: Change './giscus-widget-mock' to './giscus-widget'
const GiscusWidget = dynamic(
  () => import('./giscus-widget-mock').then(mod => ({ default: mod.GiscusWidget })),
  {
    ssr: false, // Disable SSR for Giscus (it's a client widget anyway)
    loading: () => <CommentLoadingSkeleton />
  }
);

interface CommentSectionProps {
  locale: string;
}

// Loading skeleton component
function CommentLoadingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
        <div className="flex-1">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/6"></div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
      </div>
      <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
    </div>
  );
}

// Placeholder component shown before lazy load
function CommentPlaceholder({ onClick }: { onClick: () => void }) {
  const t = useTranslations('common');
  
  return (
    <div className="min-h-[300px] bg-gray-50 dark:bg-gray-900 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 flex flex-col items-center justify-center gap-4 p-8 transition-colors hover:border-gray-400 dark:hover:border-gray-600">
      <MessageSquare className="w-12 h-12 text-gray-400 dark:text-gray-600" />
      <div className="text-center">
        <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-1">
          {t('loadingComments')}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-500">
          Scroll here to load comments • Saves 800 KB
        </p>
      </div>
      <button
        onClick={onClick}
        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center gap-2"
      >
        <MessageSquare className="w-4 h-4" />
        Load Comments Now
      </button>
    </div>
  );
}

export function CommentSection({ locale }: CommentSectionProps) {
  const t = useTranslations('common');
  const [shouldLoad, setShouldLoad] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    // Create Intersection Observer to detect when comments section is visible
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        
        // Load comments when section is 200px away from viewport
        if (entry.isIntersecting) {
          console.log('📝 Comments section visible - loading Giscus widget...');
          setIsLoading(true);
          setShouldLoad(true);
          observer.disconnect(); // Stop observing after first trigger
        }
      },
      {
        rootMargin: '200px', // Start loading 200px before section is visible
        threshold: 0.1 // Trigger when 10% of section is visible
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  // Manual load handler (for click button)
  const handleManualLoad = () => {
    console.log('📝 Manual load triggered');
    setIsLoading(true);
    setShouldLoad(true);
  };

  return (
    <div 
      ref={sectionRef}
      className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">{t('comments')}</h2>
        {!shouldLoad && (
          <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Lazy loading enabled
          </span>
        )}
      </div>

      {shouldLoad ? (
        <Suspense fallback={<CommentLoadingSkeleton />}>
          <GiscusWidget locale={locale} />
        </Suspense>
      ) : (
        <CommentPlaceholder onClick={handleManualLoad} />
      )}
    </div>
  );
}
