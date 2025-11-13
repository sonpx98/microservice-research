import { getAllPosts, getAllTags } from '@/lib/posts';
import { PostList } from '@/components/blog/post-list';
import { getTranslations, setRequestLocale } from 'next-intl/server';

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
console.log('post' , posts)
  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">{t('title')}</h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          {t('description')}
        </p>
      </div>

      <PostList posts={posts} tags={tags} />
    </div>
  );
}
