'use client';

import { useRef, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Search, X, FileText } from 'lucide-react';
import { Post } from 'contentlayer/generated';
import Fuse from 'fuse.js';

interface PostSearchModalProps {
  posts: Post[];
  isOpen: boolean;
  onClose: () => void;
}

export function PostSearchModal({ posts, isOpen, onClose }: PostSearchModalProps) {
  const t = useTranslations('common');
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Post[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Initialize Fuse.js
  const fuse = new Fuse(posts, {
    keys: [
      { name: 'title', weight: 0.4 },
      { name: 'excerpt', weight: 0.3 },
      { name: 'tags', weight: 0.3 },
    ],
    threshold: 0.3,
    includeScore: true,
    minMatchCharLength: 2,
  });

  // Search effect
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    const results = fuse.search(searchQuery);
    setSearchResults(results.map((r) => r.item).slice(0, 8));
    setSelectedIndex(0);
  }, [searchQuery]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (!isOpen) return;
    
    const html = document.documentElement;
    const body = document.body;
    const scrollbarWidth = window.innerWidth - html.clientWidth;
    
    html.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
    body.style.paddingRight = `${scrollbarWidth}px`;
    
    const preventScroll = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      if (resultsRef.current?.contains(target)) return;
      e.preventDefault();
    };
    
    document.addEventListener('touchmove', preventScroll, { passive: false });
    
    return () => {
      html.style.overflow = '';
      body.style.overflow = '';
      body.style.paddingRight = '';
      document.removeEventListener('touchmove', preventScroll);
    };
  }, [isOpen]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, searchResults.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && searchResults[selectedIndex]) {
      e.preventDefault();
      router.push(searchResults[selectedIndex].url);
      handleClose();
    }
  };

  const handleClose = () => {
    setSearchQuery('');
    setSearchResults([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[10vh] sm:pt-[15vh]"
      onClick={handleClose}
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-overlay backdrop-blur-sm" aria-hidden="true" />
      
      {/* Modal */}
      <div 
        className="relative w-full max-w-xl bg-card rounded-xl shadow-2xl border border-border overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 border-b border-border">
          <Search className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder={t('searchPlaceholder')}
            aria-label="Search posts"
            className="flex-1 py-4 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="p-1 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={handleClose}
            className="p-2 -mr-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer"
            aria-label="Close search"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results */}
        <div ref={resultsRef} className="max-h-[60vh] overflow-y-auto">
          {searchQuery.length >= 2 && searchResults.length === 0 && (
            <div className="px-4 py-8 text-center text-muted-foreground">
              <p>{t('noResults')}</p>
            </div>
          )}

          {searchResults.length > 0 && (
            <ul className="py-2">
              {searchResults.map((post, index) => (
                <li key={post.slug}>
                  <button
                    onClick={() => {
                      router.push(post.url);
                      handleClose();
                    }}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`w-full px-4 py-3 text-left flex items-start gap-3 transition-colors ${
                      index === selectedIndex
                        ? 'bg-primary/10'
                        : 'hover:bg-muted'
                    }`}
                  >
                    <FileText
                      className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                        index === selectedIndex ? 'text-primary' : 'text-muted-foreground'
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium truncate ${
                        index === selectedIndex ? 'text-primary' : 'text-foreground'
                      }`}>
                        {post.title}
                      </p>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {post.excerpt}
                      </p>
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex gap-1 mt-1">
                          {post.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="text-xs px-1.5 py-0.5 bg-muted text-muted-foreground rounded"
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

          {searchQuery.length < 2 && (
            <div className="px-4 py-8 text-center text-muted-foreground">
              <p className="text-sm">{t('searchHint')}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        {searchResults.length > 0 && (
          <div className="px-4 py-2 border-t border-border text-xs text-muted-foreground flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-muted rounded">↑</kbd>
              <kbd className="px-1.5 py-0.5 bg-muted rounded">↓</kbd>
              {t('toNavigate')}
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-muted rounded">↵</kbd>
              {t('toSelect')}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
