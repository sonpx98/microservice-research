'use client';

import { List } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { TocList } from './TocList';
import type { TocItem } from './hooks/useTableOfContents';

interface MobileTOCProps {
  headings: TocItem[];
  activeId: string;
  isOpen: boolean;
  onClose: () => void;
  onScrollTo: (id: string) => void;
}

export function MobileTOC({ headings, activeId, isOpen, onClose, onScrollTo }: MobileTOCProps) {
  const handleSelect = (id: string) => {
    onScrollTo(id);
    setTimeout(onClose, 300);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent placement="bottom" className="max-h-[60vh] gap-3 p-4 lg:hidden">
        <DialogTitle className="flex items-center gap-2 text-sm">
          <List className="h-4 w-4" />
          Table of contents
        </DialogTitle>
        <TocList headings={headings} activeId={activeId} onSelect={handleSelect} className="max-h-[50vh]" />
      </DialogContent>
    </Dialog>
  );
}
