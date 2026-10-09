'use client';

import { List, ChevronLeft, ChevronRight } from 'lucide-react';
import { TocItem } from './hooks/useTableOfContents';

interface DesktopTOCProps {
  headings: TocItem[];
  activeId: string;
  isCollapsed: boolean;
  onToggle: () => void;
  onScrollTo: (id: string) => void;
}

export function DesktopTOC({ headings, activeId, isCollapsed, onToggle, onScrollTo }: DesktopTOCProps) {
  if (isCollapsed) {
    return (
      <div className="hidden lg:block fixed top-24 left-0 z-30">
        <button
          onClick={onToggle}
          className="flex items-center gap-2 px-3 py-2 bg-card border border-border border-l-0 rounded-r-lg shadow-sm hover:bg-muted transition-colors cursor-pointer"
          title="Show Table of Contents"
        >
          <List className="w-4 h-4 text-muted-foreground" />
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
    );
  }

  return (
    <div className="hidden lg:block fixed top-24 left-0 z-30">
      <nav className="w-72 max-h-[calc(100vh-120px)] overflow-hidden bg-card border border-border border-l-0 rounded-r-lg shadow-lg animate-in slide-in-from-left duration-200">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
              <List className="w-4 h-4" />
              Table of Contents
            </h3>
            <button 
              onClick={onToggle}
              className="p-1 hover:bg-muted rounded transition-colors cursor-pointer"
              title="Collapse"
            >
              <ChevronLeft className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
          
          {headings.length === 0 ? (
            <div className="text-sm text-muted-foreground italic py-2">
              No headings found.
            </div>
          ) : (
            <ul className="space-y-0.5 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
              {headings.map((heading) => (
                <li key={heading.id} style={{ paddingLeft: `${(heading.level - 2) * 12}px` }}>
                  <button
                    onClick={() => onScrollTo(heading.id)}
                    className={`
                      text-left w-full py-1.5 px-2 rounded text-sm transition-colors truncate
                      ${activeId === heading.id
                        ? 'text-primary bg-primary/10 font-medium'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      }
                    `}
                    title={heading.text}
                  >
                    {heading.text}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </nav>
    </div>
  );
}
