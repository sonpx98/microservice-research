import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getPostBySlug, getAllPosts, getPostBySlugAnyLocale, getAvailableLocalesForPost } from '@/lib/posts';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ArrowLeft, Clock, Languages } from 'lucide-react';
import { CommentSection } from '@/components/blog/comment-section';
import { StreamingContent } from '@/components/blog/streaming-content';
import { ReadingProgress } from '@/components/blog/reading-progress';
import { TableOfContents } from '@/components/blog/table-of-contents';
import { ReadingBookmark } from '@/components/blog/reading-bookmark';
import { CodeBlockCopyButton } from '@/components/blog/code-copy-button';
import { ScrollControls } from '@/components/blog/scroll-controls';

const localeNames: Record<string, string> = {
  en: 'English',
  vi: 'Tiếng Việt',
};

export async function generateStaticParams() {
  // Get all locales and generate params for all posts
  const locales = ['en', 'vi'];
  const allParams: { locale: string; slug: string }[] = [];
  
  for (const locale of locales) {
    const posts = getAllPosts(locale);
    posts.forEach(post => {
      if (post.slug) {
        allParams.push({ locale, slug: post.slug });
      }
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

  // If post doesn't exist in this locale, check if it exists in another locale
  if (!post) {
    const postInOtherLocale = getPostBySlugAnyLocale(slug);
    
    // If post doesn't exist at all, show 404
    if (!postInOtherLocale) {
      notFound();
    }

    // Post exists but not in this locale - show translation unavailable message
    const availableLocales = getAvailableLocalesForPost(slug);
    
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Link 
          href={`/${locale}/blog`}
          className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-50 mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('backToBlog')}
        </Link>

        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-20 h-20 mb-6 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
            <Languages className="w-10 h-10 text-yellow-600 dark:text-yellow-400" />
          </div>
          
          <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
            {t('translationUnavailable')}
          </h1>
          
          <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md">
            {t('translationUnavailableDescription')}
          </p>

          <div className="space-y-4">
            <p className="text-sm text-gray-500 dark:text-gray-500">
              {t('availableIn')}:
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              {availableLocales.map((loc) => (
                <Link
                  key={loc}
                  href={`/${loc}/blog/${slug}`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
                >
                  {localeNames[loc] || loc}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <ReadingProgress />
      <ScrollControls className="bottom-28" />
      <TableOfContents />
      <ReadingBookmark slug={slug} locale={locale} />
      <CodeBlockCopyButton />
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

          <StreamingContent 
            html={post.body.html} 
            charsPerTick={30}
            tickInterval={15}
          />
        </article>

        <CommentSection locale={locale} />
      </div>
    </>
  );
}
