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
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={onClose}
        />
      )}

      {/* Bottom sheet */}
      <nav
        className={`
          lg:hidden fixed z-50 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-t-2xl shadow-lg
          transition-all duration-300 ease-in-out
          ${isOpen ? 'bottom-0 left-0 right-0 max-h-[60vh]' : '-bottom-full'}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm text-gray-900 dark:text-white flex items-center gap-2">
              <List className="w-4 h-4" />
              Table of Contents
            </h3>
            <button 
              onClick={onClose}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
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
                      ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 font-medium'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
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
