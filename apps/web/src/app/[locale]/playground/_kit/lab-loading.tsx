import { LabShell } from '@/components/layout';
import { Skeleton } from '@/components/ui/skeleton';

/** Placeholder while a lab restores its saved progress from localStorage. */
export function LabLoading({ title }: { title: string }) {
  return (
    <LabShell title={title} sidebar={<Skeleton className="h-80 w-full rounded-lg" />}>
      <Skeleton className="h-96 w-full rounded-lg" />
    </LabShell>
  );
}
