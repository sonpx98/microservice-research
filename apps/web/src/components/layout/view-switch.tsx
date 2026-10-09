import Link from 'next/link';
import { cn } from '@/lib/utils';

export interface ViewSwitchItem {
  href: string;
  label: string;
  active: boolean;
}

/** URL-driven segmented control: each option is a link, so the view survives reload and sharing. */
export function ViewSwitch({ items }: { items: ViewSwitchItem[] }) {
  return (
    <nav className="inline-flex gap-1 rounded-md border border-border bg-muted p-1">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          aria-current={item.active ? 'page' : undefined}
          className={cn(
            'rounded-sm px-3 py-1.5 font-mono text-xs transition-colors',
            item.active
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
