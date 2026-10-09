import { cn } from '@/lib/utils';
import type { TocItem } from './hooks/useTableOfContents';

interface TocListProps {
  headings: TocItem[];
  activeId: string;
  onSelect: (id: string) => void;
  className?: string;
}

/** Heading list shared by the desktop flyout and the mobile sheet. */
export function TocList({ headings, activeId, onSelect, className }: TocListProps) {
  if (headings.length === 0) {
    return <p className="py-2 text-sm text-muted-foreground">No headings found.</p>;
  }
  return (
    <ul className={cn('flex flex-col gap-0.5 overflow-y-auto', className)}>
      {headings.map((h) => (
        <li key={h.id} className={h.level === 3 ? 'pl-3' : h.level >= 4 ? 'pl-6' : undefined}>
          <a
            href={`#${h.id}`}
            onClick={(e) => {
              e.preventDefault();
              onSelect(h.id);
            }}
            title={h.text}
            className={cn(
              'block truncate rounded-md px-2 py-1.5 text-sm transition-colors',
              activeId === h.id
                ? 'bg-primary/10 font-medium text-primary'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            {h.text}
          </a>
        </li>
      ))}
    </ul>
  );
}
