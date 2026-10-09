import { getCrawledNews, getAvailableTags } from '@/lib/pika';
import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import { PageShell } from '@/components/layout';
import { Button } from '@/components/ui/button';
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
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
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
  
  return (
    <PageShell
      eyebrow={t('badge')}
      title={t('title')}
      description={t('description')}
      actions={
        <Button asChild variant="outline">
          <Link href={`/${locale}/blog`}>
            <BookOpen />
            {t('backToBlog')}
          </Link>
        </Button>
      }
    >
      <Suspense fallback={<NewsListSkeleton count={6} />}>
        <NewsContent locale={locale} q={q} tag={tag} />
      </Suspense>
    </PageShell>
  );
}
