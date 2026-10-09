import { cn } from '@/lib/utils';

export interface SectionProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

/** A titled block inside a page. Owns the h2 level and the gap between heading and content. */
export function Section({ title, description, actions, className, children }: SectionProps) {
  return (
    <section className={cn('flex flex-col gap-4', className)}>
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">{title}</h2>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
      </header>
      {children}
    </section>
  );
}
