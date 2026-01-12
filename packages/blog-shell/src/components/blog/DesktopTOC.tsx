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
          className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 border-l-0 rounded-r-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          title="Show Table of Contents"
        >
          <List className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </button>
      </div>
    );
  }

  return (
    <div className="hidden lg:block fixed top-24 left-0 z-30">
      <nav className="w-72 max-h-[calc(100vh-120px)] overflow-hidden bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 border-l-0 rounded-r-lg shadow-lg animate-in slide-in-from-left duration-200">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm text-gray-900 dark:text-white flex items-center gap-2">
              <List className="w-4 h-4" />
              Table of Contents
            </h3>
            <button 
              onClick={onToggle}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
              title="Collapse"
            >
              <ChevronLeft className="w-4 h-4 text-gray-500" />
            </button>
          </div>
          
          {headings.length === 0 ? (
            <div className="text-sm text-gray-400 italic py-2">
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
                        ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 font-medium'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
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
