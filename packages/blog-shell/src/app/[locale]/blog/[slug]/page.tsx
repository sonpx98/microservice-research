import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getPostBySlug, getAllPosts } from '@/lib/posts';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ArrowLeft, Clock } from 'lucide-react';
import { CommentSection } from '@/components/blog/comment-section';
import { MarkdownContent } from '@/components/mdx-content';

export async function generateStaticParams() {
  // Get all locales and generate params for all posts
  const locales = ['en', 'vi'];
  const allParams: { locale: string; slug: string }[] = [];
  
  for (const locale of locales) {
    const posts = getAllPosts(locale);
    posts.forEach(post => {
      allParams.push({ locale, slug: post.slug });
    });
  }
  
  return allParams;
}

export default async function PostPage({ 
  params
}: { 
  params: Promise<{ slug: string; locale: string }> 
}) {
  const { slug, locale } = await params;
  setRequestLocale(locale);
  
  const t = await getTranslations('common');
  const post = getPostBySlug(slug, locale);

  if (!post) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <Link 
        href={`/${locale}/blog`}
        className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-50 mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        {t('backToBlog')}
      </Link>

      <article>
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
          
          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
            <time dateTime={post.date}>
              {t('publishedOn')} {formatDate(post.date, locale)}
            </time>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {post.readingTime.text}
            </span>
          </div>

          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </header>

        <MarkdownContent html={post.body.html} />
      </article>

      <CommentSection locale={locale} />
    </div>
  );
}
