'use client';

import { useState } from 'react';
import { List } from 'lucide-react';
import { Fab } from '@/components/ui/floating';
import { useTableOfContents } from './hooks/useTableOfContents';
import { MobileTOC } from './MobileTOC';
import { DesktopTOC } from './DesktopTOC';

interface TableOfContentsProps {
  contentSelector?: string;
}

export function TableOfContents({ contentSelector = '.prose' }: TableOfContentsProps) {
  const { headings, activeId, scrollToHeading } = useTableOfContents(contentSelector);
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);

  return (
    <>
      {/* Mobile: Toggle Button - only if headings exist */}
      {headings.length > 0 && (
        <Fab
          variant="primary"
          onClick={() => setIsOpen(!isOpen)}
          className="fixed bottom-6 left-6 z-40 lg:hidden"
          aria-label="Toggle table of contents"
        >
          <List />
        </Fab>
      )}

      {/* Mobile TOC */}
      <MobileTOC
        headings={headings}
        activeId={activeId}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onScrollTo={scrollToHeading}
      />

      {/* Desktop TOC */}
      <DesktopTOC
        headings={headings}
        activeId={activeId}
        isCollapsed={isCollapsed}
        onToggle={() => setIsCollapsed(!isCollapsed)}
        onScrollTo={scrollToHeading}
      />
    </>
  );
}
