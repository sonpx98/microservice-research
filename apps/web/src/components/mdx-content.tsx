'use client';

import { sanitizeHtml } from '@/lib/sanitize';

interface MarkdownContentProps {
  html: string;
}

export function MarkdownContent({ html }: MarkdownContentProps) {
  return (
    <div 
      className="prose prose-lg dark:prose-invert max-w-none prose-headings:scroll-mt-20 prose-pre:bg-transparent prose-pre:p-0"
      dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }}
    />
  );
}
