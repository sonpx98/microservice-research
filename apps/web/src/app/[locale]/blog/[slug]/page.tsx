import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArticleLayout } from '@/components/layout';
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
      <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
        <Link 
          href={`/${locale}/blog`}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('backToBlog')}
        </Link>

        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-20 h-20 mb-6 rounded-full bg-warning/10 flex items-center justify-center">
            <Languages className="w-10 h-10 text-warning" />
          </div>
          
          <h1 className="text-2xl font-bold mb-4 text-foreground">
            {t('translationUnavailable')}
          </h1>
          
          <p className="text-muted-foreground mb-8 max-w-md">
            {t('translationUnavailableDescription')}
          </p>

          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {t('availableIn')}:
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              {availableLocales.map((loc) => (
                <Link
                  key={loc}
                  href={`/${loc}/blog/${slug}`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-colors"
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
      <ArticleLayout
        title={post.title}
        meta={
          <>
            <Link href={`/${locale}/blog`} className="inline-flex items-center gap-1 hover:text-foreground">
              <ArrowLeft className="h-3.5 w-3.5" />
              {t('backToBlog')}
            </Link>
            <span aria-hidden>/</span>
            <time dateTime={post.date}>{formatDate(post.date, locale)}</time>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {post.readingTime.text}
            </span>
            {post.tags?.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </>
        }
      >
        <StreamingContent html={post.body.html} charsPerTick={30} tickInterval={15} />
      </ArticleLayout>
      <div className="mx-auto w-full max-w-3xl px-4 pb-12 sm:px-6">
        <CommentSection locale={locale} />
      </div>
    </>
  );
}
