import { cn } from '@/lib/utils';

const PADDING = { none: '', sm: 'p-4', md: 'p-6' } as const;

export interface PanelProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  /** Padding of the body. Use "none" when children bring their own rows (lists, tables). */
  padding?: keyof typeof PADDING;
}

/**
 * The one surface. Border, no shadow, rounded-lg. With a title it gets a header row (h3) separated
 * by a rule; without one it is a plain padded box.
 */
export function Panel({ title, description, actions, padding = 'md', className, children, ...props }: PanelProps) {
  return (
    <div className={cn('overflow-hidden rounded-lg border border-border bg-card text-card-foreground', className)} {...props}>
      {(title || actions) && (
        <div className="flex items-start justify-between gap-3 border-b border-border px-4 py-3">
          <div className="flex min-w-0 flex-col gap-0.5">
            {title && <h3 className="text-sm font-semibold text-foreground">{title}</h3>}
            {description && <p className="text-xs text-muted-foreground">{description}</p>}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className={PADDING[padding]}>{children}</div>
    </div>
  );
}
