'use client';

import { useState, useEffect } from 'react';
import Giscus from '@giscus/react';
import { Loader2 } from 'lucide-react';

interface GiscusWidgetProps {
  locale: string;
}

export function GiscusWidget({ locale }: GiscusWidgetProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  
  const repo = process.env.NEXT_PUBLIC_GISCUS_REPO as `${string}/${string}`;
  const repoId = process.env.NEXT_PUBLIC_GISCUS_REPO_ID!;
  const category = process.env.NEXT_PUBLIC_GISCUS_CATEGORY!;
  const categoryId = process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID!;

  // Listen for Giscus iframe load
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== 'https://giscus.app') return;
      if (event.data?.giscus?.discussion) {
        setIsLoaded(true);
      }
    };

    window.addEventListener('message', handleMessage);
    
    // Fallback: set loaded after 3 seconds regardless
    const timeout = setTimeout(() => setIsLoaded(true), 3000);
    
    return () => {
      window.removeEventListener('message', handleMessage);
      clearTimeout(timeout);
    };
  }, []);

  // Don't render if env vars are missing
  if (!repo || !repoId || !categoryId) {
    return (
      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <p className="text-yellow-800 dark:text-yellow-200">
          Giscus configuration missing. Please set NEXT_PUBLIC_GISCUS_* environment variables.
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Loading overlay - fades out when Giscus loads */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-gray-950 z-10 transition-opacity duration-300">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <p className="text-sm text-gray-500 dark:text-gray-400">Loading comments...</p>
          </div>
        </div>
      )}
      
      {/* Giscus widget */}
      <div className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
        <Giscus
          repo={repo}
          repoId={repoId}
          category={category}
          categoryId={categoryId}
          mapping="pathname"
          strict="0"
          reactionsEnabled="1"
          emitMetadata="0"
          inputPosition="top"
          theme="preferred_color_scheme"
          lang={locale}
          loading="eager"
        />
      </div>
    </div>
  );
}
