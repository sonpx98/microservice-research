import Link from 'next/link';
import { Rocket } from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getAllPosts, getAllTags } from '@/lib/posts';
import { PostList } from '@/components/blog/post-list';
import { PageShell } from '@/components/layout';
import { Button } from '@/components/ui/button';

export default async function BlogPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('blog');
  const te = await getTranslations('explore');
  const posts = getAllPosts(locale);
  const tags = getAllTags(locale);

  return (
    <PageShell
      eyebrow={`${posts.length} ${t('articlesCount')} · ${tags.length} ${t('topicsCount')}`}
      title={t('title')}
      description={t('description')}
      actions={
        <Button asChild variant="outline">
          <Link href={`/${locale}/blog/explore`}>
            <Rocket />
            {te('exploreData')}
          </Link>
        </Button>
      }
    >
      <PostList posts={posts} tags={tags} />
    </PageShell>
  );
}
