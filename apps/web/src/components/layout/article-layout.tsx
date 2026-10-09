import { cn } from '@/lib/utils';

export interface ArticleLayoutProps {
  title: string;
  meta?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

/** Long-form reading column. Typography colors come from the token-driven prose styles in globals.css. */
export function ArticleLayout({ title, meta, className, children }: ArticleLayoutProps) {
  return (
    <article className={cn('mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14', className)}>
      {meta && (
        <div className="mb-4 flex flex-wrap items-center gap-3 font-mono text-xs text-muted-foreground">
          {meta}
        </div>
      )}
      <h1 className="mb-8 text-4xl font-semibold tracking-tight text-foreground">{title}</h1>
      <div className="prose max-w-none">{children}</div>
    </article>
  );
}
