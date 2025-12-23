import { getAllPosts, getAllTags } from '@/lib/posts';
import { PostList } from '@/components/blog/post-list';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { BlogHero } from '@/components/blog/blog-hero';

export default async function BlogPage({ 
  params 
}: { 
  params: Promise<{ locale: string }> 
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  
  const t = await getTranslations('blog');
  const posts = getAllPosts(locale);
  const tags = getAllTags(locale);

  const taglines = [
    t('taglines.0'),
    t('taglines.1'),
    t('taglines.2'),
    t('taglines.3'),
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <BlogHero
        badge={t('badge')}
        title={t('title')}
        taglines={taglines}
        articlesCount={posts.length}
        topicsCount={tags.length}
        articlesLabel={t('articlesCount')}
        topicsLabel={t('topicsCount')}
      />

      {/* Posts Section */}
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <PostList posts={posts} tags={tags} />
      </div>
    </div>
  );
}
