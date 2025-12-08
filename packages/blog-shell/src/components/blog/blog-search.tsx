'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Fuse from 'fuse.js';
import { Search, X, FileText } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface SearchablePost {
  slug: string;
  title: string;
  excerpt: string;
  tags: string[];
  url: string;
  date: string;
}

interface BlogSearchProps {
  posts: SearchablePost[];
  locale: string;
}

export function BlogSearch({ posts, locale }: BlogSearchProps) {
  const t = useTranslations('common');
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchablePost[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Initialize Fuse.js
  const fuse = useRef(
    new Fuse(posts, {
      keys: [
        { name: 'title', weight: 0.4 },
        { name: 'excerpt', weight: 0.3 },
        { name: 'tags', weight: 0.3 },
      ],
      threshold: 0.3,
      includeScore: true,
      minMatchCharLength: 2,
    })
  );

  // Update fuse when posts change
  useEffect(() => {
    fuse.current = new Fuse(posts, {
      keys: [
        { name: 'title', weight: 0.4 },
        { name: 'excerpt', weight: 0.3 },
        { name: 'tags', weight: 0.3 },
      ],
      threshold: 0.3,
      includeScore: true,
      minMatchCharLength: 2,
    });
  }, [posts]);

  // Search when query changes
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    const searchResults = fuse.current.search(query);
    setResults(searchResults.map((result) => result.item).slice(0, 8));
    setSelectedIndex(0);
  }, [query]);

  // Keyboard shortcut to open search (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' && results[selectedIndex]) {
        e.preventDefault();
        router.push(results[selectedIndex].url);
        setIsOpen(false);
        setQuery('');
      }
    },
    [results, selectedIndex, router]
  );

  // Scroll selected item into view
  useEffect(() => {
    if (resultsRef.current) {
      const selectedElement = resultsRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  const closeAndReset = () => {
    setIsOpen(false);
    setQuery('');
    setResults([]);
  };

  return (
    <>
      {/* Search Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      >
        <Search className="w-4 h-4" />
        <span className="hidden sm:inline">{t('search')}</span>
        <kbd className="hidden md:inline-flex items-center gap-1 px-1.5 py-0.5 text-xs font-mono bg-gray-200 dark:bg-gray-700 rounded">
          ⌘K
        </kbd>
      </button>

      {/* Search Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeAndReset}
          />

          {/* Modal */}
          <div className="relative min-h-screen flex items-start justify-center p-4 pt-[15vh]">
            <div className="relative w-full max-w-xl bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              {/* Search Input */}
              <div className="flex items-center gap-3 px-4 border-b border-gray-200 dark:border-gray-700">
                <Search className="w-5 h-5 text-gray-400" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t('searchPlaceholder')}
                  className="flex-1 py-4 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none"
                />
                {query && (
                  <button
                    onClick={() => setQuery('')}
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <kbd className="px-2 py-1 text-xs font-mono text-gray-400 bg-gray-100 dark:bg-gray-800 rounded">
                  ESC
                </kbd>
              </div>

              {/* Results */}
              <div ref={resultsRef} className="max-h-[60vh] overflow-y-auto">
                {query.length >= 2 && results.length === 0 && (
                  <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                    <p>{t('noResults')}</p>
                  </div>
                )}

                {results.length > 0 && (
                  <ul className="py-2">
                    {results.map((post, index) => (
                      <li key={post.slug}>
                        <button
                          onClick={() => {
                            router.push(post.url);
                            closeAndReset();
                          }}
                          onMouseEnter={() => setSelectedIndex(index)}
                          className={`w-full px-4 py-3 text-left flex items-start gap-3 transition-colors ${
                            index === selectedIndex
                              ? 'bg-blue-50 dark:bg-blue-900/30'
                              : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                          }`}
                        >
                          <FileText className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                            index === selectedIndex
                              ? 'text-blue-600 dark:text-blue-400'
                              : 'text-gray-400'
                          }`} />
                          <div className="flex-1 min-w-0">
                            <p className={`font-medium truncate ${
                              index === selectedIndex
                                ? 'text-blue-600 dark:text-blue-400'
                                : 'text-gray-900 dark:text-white'
                            }`}>
                              {post.title}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                              {post.excerpt}
                            </p>
                            {post.tags && post.tags.length > 0 && (
                              <div className="flex gap-1 mt-1">
                                {post.tags.slice(0, 3).map((tag) => (
                                  <span
                                    key={tag}
                                    className="text-xs px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                {query.length < 2 && (
                  <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                    <p className="text-sm">{t('searchHint')}</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              {results.length > 0 && (
                <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">↑</kbd>
                    <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">↓</kbd>
                    {t('toNavigate')}
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">↵</kbd>
                    {t('toSelect')}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
