'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { PageHeader } from './page-header';

export interface LabShellProps {
  title: string;
  description?: string;
  /** Level picker, hint and solution. Sticks beside the work area on large screens. */
  sidebar: React.ReactNode;
  children: React.ReactNode;
}

/** Frame for every playground lab: back link, header, level sidebar, work area. */
export function LabShell({ title, description, sidebar, children }: LabShellProps) {
  const { locale } = useParams<{ locale: string }>();
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <Link
        href={`/${locale}/playground`}
        className="mb-6 inline-flex items-center gap-2 font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Playground
      </Link>
      <PageHeader eyebrow="Security Lab" title={title} description={description} />
      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <aside className="lg:sticky lg:top-6 lg:self-start">{sidebar}</aside>
        <div className="flex min-w-0 flex-col gap-6 lg:col-span-2">{children}</div>
      </div>
    </div>
  );
}
