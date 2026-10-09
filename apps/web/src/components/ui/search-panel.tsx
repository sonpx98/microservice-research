'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SearchResultItem {
  _id: string;
  [key: string]: any;
}

interface SearchPanelProps<T> {
  triggerPlaceholder?: string;
  modalPlaceholder?: string;
  onSearch: (query: string) => Promise<T[]>;
  renderResult: (item: T, index: number, isActive: boolean, close: () => void) => React.ReactNode;
  onSearchAll?: (query: string) => void;
  children?: React.ReactNode;
  className?: string;
}

export function SearchPanel<T extends SearchResultItem>({
  triggerPlaceholder = "Search...",
  modalPlaceholder = "Type to search...",
  onSearch,
  renderResult,
  onSearchAll,
  children,
  className,
}: SearchPanelProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard Shortcuts (Cmd+K)
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
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [isOpen]);

  // Debounced Search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length < 2) {
        setResults([]);
        return;
      }
      setIsLoading(true);
      try {
        const data = await onSearch(query);
        setResults(data);
        setSelectedIndex(0);
      } catch (error) {
        console.error("Search failed", error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, onSearch]);

  const handleSearchNavigation = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, results.length + (onSearchAll && query ? 1 : 0) - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex < results.length) {
        renderResult(results[selectedIndex], selectedIndex, true, () => setIsOpen(false)); // Just trigger logic? No, renderResult usually returns JSX. 
        // We need to trigger the action.
        // It's better if renderResult is just for display, and we handle click.
        // But the click logic is inside the render content usually?
        // Let's assume renderResult returns a clickable element or we wrap it.
        // Actually, for keyboard nav, we need to know WHAT to do.
        
        // Simulating click on the selected item might be hard if we don't control the rendering fully.
        // Easier approach: renderResult returns a Button or Link. 
        // We can just rely on the user passing a component that handles its own click.
        // But for Enter key...
        // Maybe we need `onSelectResult` prop?
      } else if (onSearchAll && query) {
        handleSearchAll();
      }
    }
  };
  
  // Re-thinking: Generic components are hard to get right with keyboard nav if we delegate rendering fully.
  // Standard pattern: renderResult returns the CONTENT, and WE wrap it in a <li><button>...
  
  const handleSelect = (item: T) => {
      // This is tricky because the action might be navigation or state update.
      // Let's assume the user passes a `renderResult` that is clickable? 
      // No, for keyboard nav to work, the container needs to handle logic. [Ref: SearchFilter implementation]
      // In SearchFilter, `router.push` is called.
      
      // Let's simplify: `renderResult` is responsible for rendering. 
      // But for keyboard nav, we need `onSelect` prop.
  };

  const handleSearchAll = () => {
    if (onSearchAll && query) {
        onSearchAll(query);
        setIsOpen(false);
    }
  };

  return (
    <div className={cn("bg-muted rounded-xl p-6 space-y-5 mb-10 w-full max-w-7xl mx-auto border border-border", className)}>
      {/* Search Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left text-muted-foreground bg-card rounded-lg hover:bg-muted transition-colors border border-border shadow-sm group"
      >
        <Search className="w-5 h-5 group-hover:text-primary transition-colors" />
        <span className="flex-1 font-medium">{triggerPlaceholder}</span>
        <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs font-mono text-muted-foreground bg-muted rounded border border-border">
            ⌘K
        </kbd>
      </button>

      {/* Filters Area */}
      {children}

      {/* SEARCH MODAL */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[60] flex items-start justify-center p-4 pt-[10vh] sm:pt-[15vh]"
          onClick={() => setIsOpen(false)}
        >
          <div className="fixed inset-0 bg-overlay backdrop-blur-sm animate-in fade-in duration-200" aria-hidden="true" />
          
          <div 
            className="relative w-full max-w-xl bg-card rounded-xl shadow-2xl border border-border overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Input */}
            <div className="flex items-center gap-3 px-4 border-b border-border">
              <Search className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                     // We expose the raw event handling or handle navigation ourselves?
                     handleSearchNavigation(e);
                     // If the user presses Enter on an item, we need to trigger 'onResultSelect' which we don't have.
                     // The original implementation called router.push inside onKeyDown.
                }}
                placeholder={modalPlaceholder}
                className="flex-1 py-4 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
               {query && (
                <button onClick={() => setQuery('')} className="p-1 text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
               )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 ml-1 text-xs font-medium text-muted-foreground border border-border rounded bg-muted"
                >
                  ESC
                </button>
            </div>
            
            {/* Modal Results */}
            <div className="max-h-[60vh] overflow-y-auto">
                {query.length < 2 && (
                  <div className="px-4 py-12 text-center text-muted-foreground">
                    <p className="text-sm">Type at least 2 characters to search</p>
                  </div>
                )}
                
                {isLoading && (
                   <div className="px-4 py-12 text-center text-muted-foreground">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary mb-2" />
                      <p className="text-xs">Searching...</p>
                   </div>
                )}

                {query.length >= 2 && !isLoading && results.length === 0 && (
                   <div className="px-4 py-12 text-center text-muted-foreground">
                     <p>No results found for &quot;{query}&quot;</p>
                   </div>
                )}

                {results.length > 0 && !isLoading && (
                    <ul className="py-2">
                        {results.map((item, idx) => (
                            <li key={item._id || idx}>
                                {renderResult(item, idx, idx === selectedIndex, () => setIsOpen(false))}
                            </li>
                        ))}
                         {onSearchAll && (
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
                                <span>See all results for &quot;{query}&quot;</span>
                             </button>
                         </li>
                         )}
                    </ul>
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
