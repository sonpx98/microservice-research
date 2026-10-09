'use client';

import { useEffect, useEffectEvent, useState } from 'react';
import { Loader2, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogTitle } from './dialog';

export interface SearchDialogProps<T> {
  /** Trigger label and input placeholder. */
  placeholder: string;
  search: (query: string) => T[] | Promise<T[]>;
  getKey: (item: T) => string;
  renderItem: (item: T) => React.ReactNode;
  onSelect: (item: T) => void;
  /** Optional last row, e.g. "Search all results for …". */
  searchAll?: { label: (query: string) => React.ReactNode; onRun: (query: string) => void };
  minChars?: number;
}

/**
 * The one search UI: an input-looking trigger (⌘K) that opens a dialog with debounced results,
 * arrow-key navigation and Enter to select.
 */
export function SearchDialog<T>(props: SearchDialogProps<T>) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen(true);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-10 w-full items-center gap-3 rounded-md border border-input bg-card px-3 text-left text-sm text-muted-foreground transition-colors outline-none hover:border-primary/40 focus-visible:ring-[3px] focus-visible:ring-ring/50"
      >
        <Search className="h-4 w-4" />
        <span className="flex-1 truncate">{props.placeholder}</span>
        <kbd className="hidden rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] sm:inline">⌘K</kbd>
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          showCloseButton={false}
          className="top-[15vh] translate-y-0 gap-0 overflow-hidden p-0 sm:max-w-xl"
        >
          <DialogTitle className="sr-only">{props.placeholder}</DialogTitle>
          {/* Lives inside the content, so query and results reset whenever the dialog closes. */}
          <SearchBody {...props} close={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}

function SearchBody<T>({
  placeholder,
  search,
  getKey,
  renderItem,
  onSelect,
  searchAll,
  minChars = 2,
  close,
}: SearchDialogProps<T> & { close: () => void }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(0);

  const ready = query.trim().length >= minChars;
  const shown = ready ? results : [];
  const rows = shown.length + (searchAll && query.trim() ? 1 : 0);

  const runSearch = useEffectEvent(async (q: string, isCancelled: () => boolean) => {
    setLoading(true);
    try {
      const found = await search(q);
      if (!isCancelled()) {
        setResults(found);
        setActive(0);
      }
    } catch {
      if (!isCancelled()) setResults([]);
    } finally {
      if (!isCancelled()) setLoading(false);
    }
  });

  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    const timer = setTimeout(() => runSearch(query, () => cancelled), 250);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, ready]);

  const choose = (index: number) => {
    if (index < shown.length) onSelect(shown[index]);
    else if (searchAll) searchAll.onRun(query.trim());
    close();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, rows - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && rows > 0) {
      e.preventDefault();
      choose(active);
    }
  };

  const rowClass = (i: number) =>
    cn(
      'flex w-full items-start gap-3 px-4 py-3 text-left text-sm transition-colors',
      i === active ? 'bg-accent text-accent-foreground' : 'text-foreground',
    );

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-3 border-b border-border px-4">
        <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          aria-label={placeholder}
          className="h-12 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
        />
        {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
          ESC
        </kbd>
      </div>

      <div className="max-h-[60vh] overflow-y-auto">
        {!ready && (
          <p className="px-4 py-10 text-center text-sm text-muted-foreground">
            Type at least {minChars} characters to search
          </p>
        )}
        {ready && !loading && shown.length === 0 && (
          <p className="px-4 py-10 text-center text-sm text-muted-foreground">No results</p>
        )}
        {rows > 0 && (
          <ul className="py-1">
            {shown.map((item, i) => (
              <li key={getKey(item)}>
                <button type="button" className={rowClass(i)} onMouseEnter={() => setActive(i)} onClick={() => choose(i)}>
                  {renderItem(item)}
                </button>
              </li>
            ))}
            {searchAll && query.trim() && (
              <li className="border-t border-border">
                <button
                  type="button"
                  className={rowClass(shown.length)}
                  onMouseEnter={() => setActive(shown.length)}
                  onClick={() => choose(shown.length)}
                >
                  <Search className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="font-medium">{searchAll.label(query.trim())}</span>
                </button>
              </li>
            )}
          </ul>
        )}
      </div>

      {shown.length > 0 && (
        <div className="flex gap-4 border-t border-border bg-muted px-4 py-2 font-mono text-[10px] text-muted-foreground">
          <span>↑ ↓ navigate</span>
          <span>↵ select</span>
        </div>
      )}
    </div>
  );
}
