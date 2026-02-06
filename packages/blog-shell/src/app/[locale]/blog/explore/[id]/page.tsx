import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { getTranslations } from 'next-intl/server';
import { TableOfContents } from '@/components/blog/table-of-contents';
import { ScrollControls } from '@/components/blog/scroll-controls';
import { StreamingContent } from '@/components/blog/streaming-content';
import { ReadingProgress } from '@/components/blog/reading-progress';
import { CodeBlockCopyButton } from '@/components/blog/code-copy-button';

async function getArticle(id: string) {
    try {
        const GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL || 'http://127.0.0.1:8080/api';
        const res = await fetch(`${GATEWAY_URL}/news/${id}`, {
            cache: 'no-store', // Always fetch fresh
            signal: AbortSignal.timeout(60000)
        });
        
        if (!res.ok) {
            return null;
        }

        return res.json();
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
            <article className="container max-w-7xl py-12 px-4 md:px-6 mx-auto">
                {/* Back Navigation */}
                <div className="mb-8">
                    <Link 
                        href={`/${locale || 'en'}/blog/explore`}
                        className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        {t('backToExplore')}
                    </Link>
                </div>
            
             {/* ... */}

                {/* Header */}
                <header className="mb-8 space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                        <Badge variant="secondary" className="text-sm">
                            {article.source || 'Aggregated'}
                        </Badge>
                        {article.pubDate && (
                            <time className="text-sm text-gray-500">
                                {new Date(article.pubDate).toLocaleDateString(locale === 'vi' ? 'vi-VN' : 'en-US', {
                                    year: 'numeric',
                                    month: 'long', 
                                    day: 'numeric'
                                })}
                            </time>
                        )}
                    </div>

                    <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
                        {article.title}
                    </h1>
                    
                    {/* Meta info / Tags */}
                    {article.tags && article.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-2">
                            {article.tags.map((tag: string) => (
                                <Badge key={tag} variant="secondary">
                                    {tag}
                                </Badge>
                            ))}
                        </div>
                    )}
                </header>

                {/* Featured Image */}
                {article.thumbnail && (
                    <div className="relative aspect-video w-full overflow-hidden rounded-xl mb-12 shadow-lg">
                        <Image 
                            src={article.thumbnail} 
                            alt={article.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                        />
                    </div>
                )}

                {/* Content with Streaming Effect */}
                <StreamingContent 
                    html={article.content} 
                    charsPerTick={30}
                    tickInterval={15}
                />

                <Separator className="my-12" />
                
                <div className="flex justify-center">
                    <a 
                        href={article.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex h-10 items-center justify-center rounded-md bg-gray-900 px-8 text-sm font-medium text-gray-50 shadow transition-colors hover:bg-gray-900/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50 dark:bg-gray-50 dark:text-gray-900 dark:hover:bg-gray-50/90 dark:focus-visible:ring-gray-300"
                    >
                        {t('readOn')} {article.source}
                    </a>
                </div>
            </article>
        </>
    );
}
