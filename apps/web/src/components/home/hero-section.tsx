'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { TypewriterLoop } from '@/components/ui/typewriter';

interface HeroSectionProps {
  locale: string;
  greeting: string;
  name: string;
  role: string;
  taglines: string[];
  viewBlog: string;
  viewGraph: string;
}

export function HeroSection({ locale, greeting, name, role, taglines, viewBlog, viewGraph }: HeroSectionProps) {
  return (
    <section className="relative border-b border-border bg-grid">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-28">
        <p className="font-mono text-xs uppercase tracking-widest text-primary">
          {greeting} {name}
        </p>
        <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-foreground md:text-6xl">
          {role}
        </h1>
        <div className="mt-6 flex h-16 max-w-2xl items-start text-lg text-muted-foreground md:h-12 md:text-xl">
          <TypewriterLoop texts={taglines} speed={30} deleteSpeed={15} pauseDuration={2000} />
        </div>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link
            href={`/${locale}/blog`}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {viewBlog}
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href={`/${locale}/knowledge-graph`}
            className="inline-flex items-center justify-center gap-2 rounded-md border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            {viewGraph}
          </Link>
        </div>
      </div>
    </section>
  );
}
