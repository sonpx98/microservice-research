import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Thumbnail } from './thumbnail';

export interface ContentCardProps {
  href: string;
  title: string;
  /** Small mono label above the title: source, section, type. */
  eyebrow: string;
  image?: string;
  date?: string;
  excerpt?: string;
  tags?: string[];
}

/** Card for any list of articles: blog posts, crawled news, readings. */
export function ContentCard({ href, title, eyebrow, image, date, excerpt, tags }: ContentCardProps) {
  return (
    <Link
      href={href}
      className="group flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-primary"
    >
      <Thumbnail key={image} src={image} alt={title} />
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center justify-between gap-2 font-mono text-xs text-muted-foreground">
          <span className="truncate text-primary">{eyebrow}</span>
          {date && <time className="shrink-0">{date}</time>}
        </div>
        <h3 className="line-clamp-2 font-semibold leading-snug text-card-foreground transition-colors group-hover:text-primary">
          {title}
        </h3>
        {excerpt && <p className="line-clamp-2 text-sm text-muted-foreground">{excerpt}</p>}
        {tags && tags.length > 0 && (
          <div className="mt-auto flex flex-wrap gap-1.5 pt-2">
            {tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="font-normal">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
