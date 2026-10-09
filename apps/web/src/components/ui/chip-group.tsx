'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';

/** Labelled row of Chips that collapses to two lines with a Show more toggle. */
export function ChipGroup({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [overflows, setOverflows] = useState(false);
  const [expanded, setExpanded] = useState(false);

  // Measured in an observer callback (not during an effect body) so it also tracks resizes.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setOverflows(el.scrollHeight > el.clientHeight + 4));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div className="flex items-center justify-between">
        <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
        {(overflows || expanded) && (
          <Button variant="link" size="sm" className="h-auto p-0" onClick={() => setExpanded(!expanded)}>
            {expanded ? 'Show less' : 'Show more'}
            {expanded ? <ChevronUp /> : <ChevronDown />}
          </Button>
        )}
      </div>
      <div ref={ref} className={cn('flex flex-wrap gap-2 overflow-hidden', !expanded && 'max-h-16')}>
        {children}
      </div>
    </div>
  );
}
