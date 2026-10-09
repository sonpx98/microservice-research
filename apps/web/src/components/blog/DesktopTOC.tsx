'use client';

import { List, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FloatingCard } from '@/components/ui/floating';
import { TocList } from './TocList';
import type { TocItem } from './hooks/useTableOfContents';

interface DesktopTOCProps {
  headings: TocItem[];
  activeId: string;
  isCollapsed: boolean;
  onToggle: () => void;
  onScrollTo: (id: string) => void;
}

export function DesktopTOC({ headings, activeId, isCollapsed, onToggle, onScrollTo }: DesktopTOCProps) {
  return (
    <div className="fixed top-24 left-0 z-30 hidden lg:block">
      {isCollapsed ? (
        <Button variant="outline" size="sm" onClick={onToggle} className="rounded-l-none border-l-0" title="Show table of contents">
          <List />
          <ChevronRight />
        </Button>
      ) : (
        <FloatingCard className="w-72 rounded-l-none border-l-0 animate-in slide-in-from-left duration-200">
          <nav aria-label="Table of contents">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <List className="h-4 w-4" />
                Table of contents
              </h3>
              <Button variant="ghost" size="icon-sm" onClick={onToggle} aria-label="Collapse">
                <ChevronLeft />
              </Button>
            </div>
            <TocList headings={headings} activeId={activeId} onSelect={onScrollTo} className="max-h-[calc(100vh-200px)] pr-2" />
          </nav>
        </FloatingCard>
      )}
    </div>
  );
}
