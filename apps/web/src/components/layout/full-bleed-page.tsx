import { cn } from '@/lib/utils';
import { PageHeader, type PageHeaderProps } from './page-header';

export interface FullBleedPageProps extends PageHeaderProps {
  bodyClassName?: string;
  children: React.ReactNode;
}

/** Header on the content column, body fills the remaining viewport edge to edge (graphs, visualizers). */
export function FullBleedPage({ bodyClassName, className, children, ...header }: FullBleedPageProps) {
  return (
    <div className={cn('flex h-full min-h-0 flex-col', className)}>
      <div className="mx-auto w-full max-w-6xl px-4 pt-8 sm:px-6">
        <PageHeader {...header} className="border-b-0 pb-6" />
      </div>
      <div className={cn('min-h-0 flex-1 border-t border-border', bodyClassName)}>{children}</div>
    </div>
  );
}
