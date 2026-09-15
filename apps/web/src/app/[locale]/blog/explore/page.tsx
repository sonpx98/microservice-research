import { getCrawledNews, getAvailableTags } from '@/lib/pika';
import { BlogHero } from '@/components/blog/blog-hero';
import { NewsList } from '@/components/blog/news-list';
import { NewsListSkeleton } from '@/components/blog/news-skeleton';
import { SearchFilter } from '@/components/blog/search-filter';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

async function NewsContent({ 
  locale, 
  q, 
  tag 
}: { 
  locale: string; 
  q: string; 
  tag: string; 
}) {
  const [{ items, total, sources }, tags] = await Promise.all([
    getCrawledNews(1, 6, q, tag),
    getAvailableTags()
  ]);

  return (
    <>
      <SearchFilter tags={tags} />
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          {(await getTranslations('explore'))('latestUpdates')}
        </h2>
      </div>
      <NewsList news={items} initialTotal={total} />
    </>
  );
}

export default async function ExplorePage({ 
  params,
  searchParams
}: { 
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { locale } = await params;
  const resolvedSearchParams = await searchParams;
  const q = typeof resolvedSearchParams.q === 'string' ? resolvedSearchParams.q : '';
  const tag = typeof resolvedSearchParams.tag === 'string' ? resolvedSearchParams.tag : '';

  setRequestLocale(locale);
  const t = await getTranslations('explore');
  
  // Fetch initial data for hero (fast, no external API)
  const taglines = t.raw('taglines') as string[];

  return (
    <div className="min-h-screen">
      {/* Hero Section - renders immediately */}
      <BlogHero
        badge={t('badge')}
        title={t('title')}
        taglines={taglines}
        articlesCount={0}
        topicsCount={0}
        articlesLabel={t('articlesLabel')}
        topicsLabel={t('topicsLabel')}
        isExploreMode={true}
      />

      {/* News Grid Section - with Suspense for loading state */}
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <Suspense fallback={<NewsListSkeleton count={6} />}>
          <NewsContent locale={locale} q={q} tag={tag} />
        </Suspense>
      </div>
    </div>
  );
}
