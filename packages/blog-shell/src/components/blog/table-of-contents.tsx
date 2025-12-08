'use client';

import { useEffect, useState, useCallback } from 'react';
import { List, ChevronLeft, ChevronRight, X } from 'lucide-react';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  contentSelector?: string;
}

export function TableOfContents({ contentSelector = '.prose' }: TableOfContentsProps) {
  const [headings, setHeadings] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true); // Desktop: collapsed by default

  // Function to extract headings
  const extractHeadings = useCallback(() => {
    const content = document.querySelector(contentSelector);
    if (!content) return;

    const elements = content.querySelectorAll('h2, h3');
    const items: TocItem[] = Array.from(elements)
      .filter(el => el.id) // Only include headings with IDs
      .map((element) => ({
        id: element.id,
        text: element.textContent || '',
        level: parseInt(element.tagName.charAt(1)),
      }));

    // Only update if headings changed
    setHeadings(prev => {
      if (prev.length !== items.length) return items;
      const changed = items.some((item, i) => prev[i]?.id !== item.id);
      return changed ? items : prev;
    });
  }, [contentSelector]);

  useEffect(() => {
    // Initial extraction
    extractHeadings();
    
    // Watch for DOM changes (for streaming content)
    const content = document.querySelector(contentSelector);
    if (!content) return;

    const observer = new MutationObserver(() => {
      extractHeadings();
    });

    observer.observe(content, {
      childList: true,
      subtree: true,
    });

    // Also re-check after a delay (fallback)
    const timeout = setTimeout(extractHeadings, 1000);
    const timeout2 = setTimeout(extractHeadings, 3000);

    return () => {
      observer.disconnect();
      clearTimeout(timeout);
      clearTimeout(timeout2);
    };
  }, [contentSelector, extractHeadings]);

  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-80px 0px -80% 0px',
        threshold: 0,
      }
    );

    headings.forEach((heading) => {
      const element = document.getElementById(heading.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [headings]);

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -80;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
      setIsOpen(false);
    }
  };

  if (headings.length === 0) return null;

  return (
    <>
      {/* Mobile: Toggle Button - bottom left */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed bottom-6 left-6 z-40 p-3 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition-colors"
        aria-label="Toggle table of contents"
      >
        <List className="w-5 h-5" />
      </button>

      {/* Mobile: Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile: Bottom sheet */}
      <nav
        className={`
          lg:hidden fixed z-50 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-t-2xl shadow-lg
          transition-all duration-300 ease-in-out
          ${isOpen ? 'bottom-0 left-0 right-0 max-h-[60vh]' : '-bottom-full'}
        `}
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm text-gray-900 dark:text-white flex items-center gap-2">
              <List className="w-4 h-4" />
              Table of Contents
            </h3>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <ul className="space-y-1 max-h-[50vh] overflow-y-auto">
            {headings.map((heading) => (
              <li
                key={heading.id}
                style={{ paddingLeft: `${(heading.level - 2) * 12}px` }}
              >
                <button
                  onClick={() => scrollToHeading(heading.id)}
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

      {/* Desktop: Collapsible sidebar on LEFT */}
      <div className="hidden lg:block fixed top-24 left-0 z-30">
        {/* Collapsed state - just a toggle button */}
        {isCollapsed ? (
          <button
            onClick={() => setIsCollapsed(false)}
            className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 border-l-0 rounded-r-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            title="Show Table of Contents"
          >
            <List className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>
        ) : (
          /* Expanded state - full TOC panel */
          <nav className="w-72 max-h-[calc(100vh-120px)] overflow-hidden bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 border-l-0 rounded-r-lg shadow-lg animate-in slide-in-from-left duration-200">
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                  <List className="w-4 h-4" />
                  Table of Contents
                </h3>
                <button 
                  onClick={() => setIsCollapsed(true)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                  title="Collapse"
                >
                  <ChevronLeft className="w-4 h-4 text-gray-500" />
                </button>
              </div>
              <ul className="space-y-0.5 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
                {headings.map((heading) => (
                  <li
                    key={heading.id}
                    style={{ paddingLeft: `${(heading.level - 2) * 12}px` }}
                  >
                    <button
                      onClick={() => scrollToHeading(heading.id)}
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
            </div>
          </nav>
        )}
      </div>
    </>
  );
}
