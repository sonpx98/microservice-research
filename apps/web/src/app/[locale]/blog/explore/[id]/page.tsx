import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { ArticleLayout, Thumbnail } from '@/components/layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getTranslations } from 'next-intl/server';
import { TableOfContents } from '@/components/blog/table-of-contents';
import { ScrollControls } from '@/components/blog/scroll-controls';
import { StreamingContent } from '@/components/blog/streaming-content';
import { ReadingProgress } from '@/components/blog/reading-progress';
import { CodeBlockCopyButton } from '@/components/blog/code-copy-button';

async function getArticle(id: string) {
    try {
        const GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL || 'http://localhost:3000/api';
        const res = await fetch(`${GATEWAY_URL}/news/${id}`, {
            cache: 'no-store', // Always fetch fresh
            signal: AbortSignal.timeout(60000)
        });
        
        if (!res.ok) {
            return null;
        }

        return await res.json();
    } catch (e) {
        return null;
    }
}

export default async function DetailPage({ params }: { params: Promise<{ id: string, locale?: string }> }) {
    const { id, locale } = await params;
    const article = await getArticle(id);
    const t = await getTranslations('explore');

    if (!article) {
        notFound();
    }

    return (
        <>
            <ReadingProgress />
            <ScrollControls className="bottom-28" />
            <TableOfContents />
            <CodeBlockCopyButton />
            <ArticleLayout
                title={article.title}
                meta={
                    <>
                        <Link href={`/${locale || 'en'}/blog/explore`} className="inline-flex items-center gap-1 hover:text-foreground">
                            <ArrowLeft className="h-3.5 w-3.5" />
                            {t('backToExplore')}
                        </Link>
                        <span aria-hidden>/</span>
                        <span className="text-primary">{article.source || 'Aggregated'}</span>
                        {article.pubDate && (
                            <time>
                                {new Date(article.pubDate).toLocaleDateString(locale === 'vi' ? 'vi-VN' : 'en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                })}
                            </time>
                        )}
                        {article.tags?.map((tag: string) => (
                            <Badge key={tag} variant="secondary">
                                {tag}
                            </Badge>
                        ))}
                    </>
                }
            >
                {article.thumbnail && (
                    <div className="not-prose mb-10 overflow-hidden rounded-lg border border-border">
                        <Thumbnail src={article.thumbnail} alt={article.title} />
                    </div>
                )}
                <StreamingContent html={article.content} charsPerTick={30} tickInterval={15} />
                <div className="not-prose mt-12 flex justify-center border-t border-border pt-8">
                    <Button asChild>
                        <a href={article.link} target="_blank" rel="noopener noreferrer">
                            {t('readOn')} {article.source}
                            <ExternalLink />
                        </a>
                    </Button>
                </div>
            </ArticleLayout>
        </>
    );
}
