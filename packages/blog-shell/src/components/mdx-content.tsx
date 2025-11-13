'use client';

interface MarkdownContentProps {
  html: string;
}

export function MarkdownContent({ html }: MarkdownContentProps) {
  return (
    <div 
      className="prose prose-lg max-w-none dark:prose-invert"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
