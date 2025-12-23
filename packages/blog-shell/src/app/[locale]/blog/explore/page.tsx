import { getCrawledNews, getAvailableTags } from '@/lib/pika';
import { BlogHero } from '@/components/blog/blog-hero';
import { NewsList } from '@/components/blog/news-list';
import { SearchFilter } from '@/components/blog/search-filter';
import { setRequestLocale, getTranslations } from 'next-intl/server';

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
  
  // Fetch data with filters
  const [{ items, total, sources }, tags] = await Promise.all([
     getCrawledNews(1, 6, q, tag),
     getAvailableTags()
  ]);

  const taglines = t.raw('taglines') as string[];

  return (
    <div className="min-h-screen">
      {/* Hero Section with Explore Mode enabled */}
      <BlogHero
        badge={t('badge')}
        title={t('title')}
        taglines={taglines}
        articlesCount={total}
        topicsCount={sources}
        articlesLabel={t('articlesLabel')}
        topicsLabel={t('topicsLabel')}
        isExploreMode={true}
      />

      {/* News Grid Section */}
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <SearchFilter tags={tags} />

        <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                {t('latestUpdates')}
            </h2>
        </div>
        
        <NewsList news={items} initialTotal={total} />
      </div>
    </div>
  );
}
