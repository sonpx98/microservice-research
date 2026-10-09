'use client';
import { useState, useEffect, useRef, useTransition, useLayoutEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useDebounce } from 'use-debounce';
import { Search, X, FileText, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { NewsItem } from '@/lib/pika';

interface SearchFilterProps {
  tags: string[];
}

export function SearchFilter({ tags }: SearchFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [debouncedQuery] = useDebounce(query, 300);
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  // Collapsible Tags State
  const [isExpanded, setIsExpanded] = useState(false);
  const [showExpandButton, setShowExpandButton] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const tagsRef = useRef<HTMLDivElement>(null);
  
  const activeTag = searchParams.get('tag') || null;

  // Measure tags height
  useLayoutEffect(() => {
    if (tagsRef.current) {
        // 80px covers roughly 2 rows (32px * 2 + 8px gap = 72px + buffer)
        setShowExpandButton(tagsRef.current.scrollHeight > 80);
    }
  }, [tags]);

  // Global Keyboard Shortcuts
  // ... (rest of the file)
// ...

  // Focus input
  useEffect(() => {
    if (isOpen && inputRef.current) {
        // small delay to allow render
        setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [isOpen]);
  
  const handleSearchAll = () => {
      // Navigate to explore page with query
      const params = new URLSearchParams(searchParams);
      if (query) {
          params.set('q', query);
      } else {
          params.delete('q');
      }
      params.delete('page');
      router.push(`${pathname}?${params.toString()}`);
      setIsOpen(false);
  }

  // Navigation
   const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      // Allow selecting "Search All" as last item
      setSelectedIndex((prev) => Math.min(prev + 1, results.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selectedIndex]) {
         router.push(`/blog/explore/${results[selectedIndex]._id}`);
         setIsOpen(false);
      } else {
         // Search All (last item or default)
         handleSearchAll();
      }
    }
  };

  // Tag Handling
  const toggleTag = (tag: string) => {
    const params = new URLSearchParams(searchParams);
    if (activeTag === tag) params.delete('tag');
    else params.set('tag', tag);
    params.delete('page');
    router.replace(`${pathname}?${params.toString()}`);
  };

    const clearTag = () => {
    const params = new URLSearchParams(searchParams);
    params.delete('tag');
    params.delete('page');
    router.replace(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="space-y-6 mb-10 p-6 rounded-2xl bg-card border border-border shadow-sm">
      {/* Search Bar - Trigger */}
        <button
          onClick={() => setIsOpen(true)}
          className="w-full flex items-center gap-3 px-4 py-3 text-left text-muted-foreground bg-card rounded-lg hover:bg-muted transition-colors border border-border shadow-sm group"
        >
          <Search className="w-5 h-5 group-hover:text-primary transition-colors" />
          <span className="flex-1 font-medium">Search explore posts...</span>
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs font-mono text-muted-foreground bg-muted rounded border border-border">
            ⌘K
          </kbd>
        </button>

      {/* Filter by Tag */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Filter by tag
            </div>
            {showExpandButton && (
                <button 
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-xs font-medium text-primary hover:text-primary flex items-center gap-1"
                >
                  {isExpanded ? 'Show Less' : 'Show More'}
                  {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
            )}
        </div>
        
        <div 
          ref={tagsRef}
          className={cn(
            "flex flex-wrap gap-2 overflow-hidden transition-all duration-300 ease-in-out",
            isExpanded ? "max-h-[2000px]" : "max-h-[76px]"
          )}
        >
          <Badge
            variant={!activeTag ? "default" : "outline"}
            className={cn(
              "cursor-pointer hover:bg-primary/90 hover:text-primary-foreground transition-colors px-4 py-1.5 h-auto text-sm",
              !activeTag ? "bg-primary hover:bg-primary/90 border-transparent" : "text-muted-foreground"
            )}
            onClick={clearTag}
          >
            All Posts
          </Badge>
          
          {tags.map((tag) => (
            <Badge
              key={tag}
              variant={activeTag === tag ? "default" : "outline"}
              className={cn(
                "cursor-pointer transition-colors px-3 py-1.5 h-auto text-sm font-medium",
                activeTag === tag 
                  ? "bg-primary hover:bg-primary/90 border-transparent text-primary-foreground" 
                  : "text-muted-foreground hover:border-input hover:text-foreground"
              )}
              onClick={() => toggleTag(tag)}
            >
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      {/* Modal */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[60] flex items-start justify-center p-4 pt-[10vh] sm:pt-[15vh]"
          onClick={() => setIsOpen(false)}
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-overlay backdrop-blur-sm"
            aria-hidden="true"
          />
          
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
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search articles..."
                aria-label="Search articles"
                className="flex-1 py-4 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
               {query && (
                <button
                  onClick={() => setQuery('')}
                  className="p-1 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
               )}
               {/* Close button for mobile accessibility */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 -mr-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                  aria-label="Close search"
                >
                  <X className="w-5 h-5" />
                </button>
            </div>
            
            {/* Results */}
            <div ref={resultsRef} className="max-h-[60vh] overflow-y-auto">
                {query.length < 2 && (
                  <div className="px-4 py-8 text-center text-muted-foreground">
                    <p className="text-sm">Type at least 2 characters to search</p>
                  </div>
                )}

                {query.length >= 2 && results.length === 0 && !isLoading && (
                   <div className="px-4 py-8 text-center text-muted-foreground">
                     <p>No results found</p>
                   </div>
                )}
                
                {isLoading && (
                   <div className="px-4 py-8 text-center text-muted-foreground">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                   </div>
                )}

                {results.length > 0 && !isLoading && (
                    <ul className="py-2">
                        {results.map((item, idx) => (
                            <li key={item._id}>
                                <button
                                    onClick={() => { router.push(`/blog/explore/${item._id}`); setIsOpen(false); }}
                                    onMouseEnter={() => setSelectedIndex(idx)}
                                    className={cn(
                                        "w-full text-left px-4 py-3 flex items-start gap-3 transition-colors",
                                        idx === selectedIndex ? "bg-primary/10" : "hover:bg-muted"
                                    )}
                                >
                                    <FileText className={cn("w-5 h-5 mt-0.5 flex-shrink-0", idx === selectedIndex ? "text-primary" : "text-muted-foreground")} />
                                    <div className="flex-1 min-w-0">
                                        <div className={cn("font-medium truncate", idx === selectedIndex ? "text-primary" : "text-foreground")}>
                                            {item.title}
                                        </div>
                                        <div className="text-sm text-muted-foreground line-clamp-1">
                                            {item.source} • {item.pubDate ? new Date(item.pubDate).getFullYear() : 'N/A'}
                                        </div>
                                    </div>
                                </button>
                            </li>
                        ))}
                         {query.length > 0 && (
                            <li>
                             <button
                                onClick={handleSearchAll}
                                onMouseEnter={() => setSelectedIndex(results.length)}
                                className={cn(
                                    "w-full text-left px-4 py-3 flex items-start gap-3 transition-colors text-sm font-medium border-t border-border",
                                    selectedIndex === results.length ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
                                )}
                             >
                                <Search className={cn("w-5 h-5", selectedIndex === results.length ? "text-primary" : "text-muted-foreground")} />
                                <span>Search all results for &quot;{query}&quot;</span>
                             </button>
                            </li>
                        )}
                    </ul>
                )}
            </div>
            
             {/* Footer */}
              {results.length > 0 && (
                <div className="px-4 py-2 border-t border-border text-xs text-muted-foreground flex items-center gap-4 bg-muted">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-muted rounded">↑</kbd>
                    <kbd className="px-1.5 py-0.5 bg-muted rounded">↓</kbd>
                    to navigate
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-muted rounded">↵</kbd>
                    to select
                  </span>
                </div>
              )}
          </div>
        </div>
      )}
    </div>
  );
}
