'use client';

import { BookOpen, Terminal } from 'lucide-react';
import { TypewriterLoop } from '@/components/ui/typewriter';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

interface BlogHeroProps {
  badge: string;
  title: string;
  taglines: string[];
  articlesCount: number;
  topicsCount: number;
  articlesLabel: string;
  topicsLabel: string;
}

export function BlogHero({
  badge,
  title,
  taglines,
  articlesCount,
  topicsCount,
  articlesLabel,
  topicsLabel,
  isExploreMode = false,
}: BlogHeroProps & { isExploreMode?: boolean }) {
  const params = useParams();
  const locale = params?.locale as string || 'en';
  const t = useTranslations('explore');

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 text-white">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff10_1px,transparent_1px),linear-gradient(to_bottom,#ffffff10_1px,transparent_1px)] bg-[size:24px_24px]" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/30 rounded-full blur-3xl" />
      
      <div className="relative container mx-auto px-4 py-16 md:py-24 max-w-6xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-sm font-medium w-fit">
            <Terminal className="w-4 h-4" />
            {badge}
          </div>
          <Link 
            href={isExploreMode ? `/${locale}/blog` : `/${locale}/blog/explore`}
            className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-colors border border-white/20 font-medium w-fit"
          >
            {isExploreMode ? (
              <>
                <BookOpen className="w-4 h-4" />
                {t('backToBlog')}
              </>
            ) : (
              <>
                <span>🚀</span>
                {t('exploreData')}
              </>
            )}
          </Link>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          {title}
        </h1>
        
        <div className="text-lg md:text-xl text-white/80 max-w-2xl h-14 md:h-8 flex items-start">
          <TypewriterLoop 
            texts={taglines}
            speed={25}
            deleteSpeed={15}
            pauseDuration={2000}
          />
        </div>
        
        {/* Stats */}
        <div className="flex gap-8 mt-8">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-300" />
            <span className="text-white/90">{articlesCount} {articlesLabel}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏷️</span>
            <span className="text-white/90">{topicsCount} {topicsLabel}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
