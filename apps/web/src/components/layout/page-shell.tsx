import { cn } from '@/lib/utils';
import { PageHeader, type PageHeaderProps } from './page-header';

const WIDTHS = { prose: 'max-w-3xl', wide: 'max-w-6xl' } as const;

export interface PageShellProps extends PageHeaderProps {
  width?: keyof typeof WIDTHS;
  children: React.ReactNode;
}

/** Standard scrolling page: centered column, header, content. */
export function PageShell({ width = 'wide', className, children, ...header }: PageShellProps) {
  return (
    <div className={cn('mx-auto w-full px-4 py-10 sm:px-6 sm:py-14', WIDTHS[width], className)}>
      <PageHeader {...header} />
      <div className="pt-8">{children}</div>
    </div>
  );
}
