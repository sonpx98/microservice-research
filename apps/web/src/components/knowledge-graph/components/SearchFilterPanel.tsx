'use client';

import { Minimize2, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { FloatingCard } from '@/components/ui/floating';
import { Input } from '@/components/ui/input';

interface SearchFilterPanelProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  typeFilter: string;
  onTypeFilterChange: (type: string) => void;
  availableTypes: string[];
  isExpanded: boolean;
  onExpandToggle: () => void;
  filteredCount: number;
  totalCount: number;
}

const label = (type: string) => (type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1));

/** Floating search and type filter over the graph canvas. */
export function SearchFilterPanel({
  searchQuery,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  availableTypes,
  isExpanded,
  onExpandToggle,
  filteredCount,
  totalCount,
}: SearchFilterPanelProps) {
  const hasActiveFilter = Boolean(searchQuery) || typeFilter !== 'all';

  return (
    <div className="absolute top-4 left-4 z-50">
      {!isExpanded ? (
        <FloatingCard className="flex items-center gap-2 p-1.5">
          <Button variant="ghost" size="icon-sm" onClick={onExpandToggle} aria-label="Search and filter">
            <Search />
          </Button>
          {hasActiveFilter && <span className="pr-2 font-mono text-xs text-primary">{filteredCount}</span>}
        </FloatingCard>
      ) : (
        <FloatingCard className="flex w-80 flex-col gap-3 p-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Search and filter</h3>
            <Button variant="ghost" size="icon-sm" onClick={onExpandToggle} aria-label="Collapse">
              <Minimize2 />
            </Button>
          </div>

          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search nodes..."
              aria-label="Search nodes"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="px-9"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => onSearchChange('')}
                aria-label="Clear search"
                className="absolute top-1/2 right-1 -translate-y-1/2"
              >
                <X />
              </Button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {availableTypes.map((type) => (
              <Chip key={type} active={typeFilter === type} onClick={() => onTypeFilterChange(type)}>
                {label(type)}
              </Chip>
            ))}
          </div>

          {hasActiveFilter && (
            <div className="flex items-center justify-between border-t border-border pt-3 font-mono text-xs text-muted-foreground">
              <span>Results</span>
              <span className="text-foreground">
                {filteredCount} / {totalCount}
              </span>
            </div>
          )}
        </FloatingCard>
      )}
    </div>
  );
}
