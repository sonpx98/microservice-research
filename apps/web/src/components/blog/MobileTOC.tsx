'use client';

import { List, X } from 'lucide-react';
import { TocItem } from './hooks/useTableOfContents';

interface MobileTOCProps {
  headings: TocItem[];
  activeId: string;
  isOpen: boolean;
  onClose: () => void;
  onScrollTo: (id: string) => void;
}

export function MobileTOC({ headings, activeId, isOpen, onClose, onScrollTo }: MobileTOCProps) {
  const handleScrollTo = (id: string) => {
    onScrollTo(id);
    setTimeout(() => onClose(), 300);
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-overlay z-40"
          onClick={onClose}
        />
      )}

      {/* Bottom sheet */}
      <nav
        className={`
          lg:hidden fixed z-50 bg-card border border-border rounded-t-2xl shadow-lg
          transition-all duration-300 ease-in-out
          ${isOpen ? 'bottom-0 left-0 right-0 max-h-[60vh]' : '-bottom-full'}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
              <List className="w-4 h-4" />
              Table of Contents
            </h3>
            <button 
              onClick={onClose}
              className="p-1 hover:bg-muted rounded cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <ul className="space-y-1 max-h-[50vh] overflow-y-auto">
            {headings.map((heading) => (
              <li key={heading.id} style={{ paddingLeft: `${(heading.level - 2) * 12}px` }}>
                <button
                  onClick={() => handleScrollTo(heading.id)}
                  className={`
                    text-left w-full py-1.5 px-2 rounded text-sm transition-colors
                    ${activeId === heading.id
                      ? 'text-primary bg-primary/10 font-medium'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }
                  `}
                >
                  {heading.text}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </>
  );
}
