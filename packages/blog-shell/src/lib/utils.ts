import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date, locale: string = 'en'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(dateObj);
}

export function injectHeadingIds(html: string): string {
  if (!html) return '';

  // First, convert bold paragraphs to h3
  let processedHtml = html.replace(/<p(?:\s+[^>]*)?>\s*<(?:b|strong)>([\s\S]*?)<\/(?:b|strong)>\s*<\/p>/gi,
    (match, content) => `<h3>${content}</h3>`
  );

  // Then inject IDs into all headings
  return processedHtml.replace(/<h([2-4])([^>]*)>([\s\S]*?)<\/h\1>/gi, (match, level, attrs, content) => {
    if (attrs.includes('id=')) return match;

    const slug = content
      .replace(/<[^>]*>/g, '') // remove tags
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const id = slug || `heading-${Math.random().toString(36).substr(2, 9)}`;
    return `<h${level} id="${id}"${attrs}>${content}</h${level}>`;
  });
}
