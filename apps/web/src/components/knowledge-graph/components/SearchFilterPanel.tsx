'use client';

import { Search, X, Filter, ChevronDown, Minimize2 } from 'lucide-react';

interface SearchFilterPanelProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  typeFilter: string;
  onTypeFilterChange: (type: string) => void;
  availableTypes: string[];
  isExpanded: boolean;
  onExpandToggle: () => void;
  isFilterOpen: boolean;
  onFilterToggle: () => void;
  filteredCount: number;
  totalCount: number;
}

export function SearchFilterPanel({
  searchQuery,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  availableTypes,
  isExpanded,
  onExpandToggle,
  isFilterOpen,
  onFilterToggle,
  filteredCount,
  totalCount,
}: SearchFilterPanelProps) {
  const hasActiveFilter = searchQuery || typeFilter !== 'all';

  return (
    <div className="absolute top-4 left-4 z-50">
      <div className="bg-card/95 backdrop-blur-md rounded-lg shadow-lg border border-border">
        {/* Collapsed State - Just Icons */}
        {!isExpanded && (
          <div className="flex items-center gap-2 p-2">
            <button
              onClick={onExpandToggle}
              className="p-2 hover:bg-muted rounded-md transition-colors cursor-pointer"
              title="Expand search"
            >
              <Search className="w-4 h-4 text-muted-foreground" />
            </button>
            {hasActiveFilter && (
              <div className="px-2 py-1 bg-primary/10 rounded-md text-xs font-medium text-primary">
                {filteredCount}
              </div>
            )}
          </div>
        )}

        {/* Expanded State */}
        {isExpanded && (
          <div className="p-3 w-80">
            {/* Header with Collapse Button */}
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-foreground">Search & Filter</h3>
              <button
                onClick={onExpandToggle}
                className="p-1 hover:bg-muted rounded transition-colors cursor-pointer"
                title="Collapse"
              >
                <Minimize2 className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </div>

            {/* Search Input */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search nodes..."
                aria-label="Search nodes"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-10 py-2 rounded-lg border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Type Filter Dropdown */}
            <div className="relative">
              <button
                onClick={onFilterToggle}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-input bg-card text-sm text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-muted-foreground" />
                  <span>
                    {typeFilter === 'all' 
                      ? 'All Types' 
                      : typeFilter.charAt(0).toUpperCase() + typeFilter.slice(1)}
                  </span>
                </div>
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {isFilterOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-xl overflow-hidden z-[100]">
                  {availableTypes.map((type) => (
                    <button
                      key={type}
                      onClick={() => {
                        onTypeFilterChange(type);
                        onFilterToggle();
                      }}
                      className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                        typeFilter === type
                          ? 'bg-primary/10 text-primary font-medium'
                          : 'text-foreground hover:bg-muted'
                      }`}
                    >
                      {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Results Counter */}
            {hasActiveFilter && (
              <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Results:</span>
                <span className="font-medium text-foreground">
                  {filteredCount} / {totalCount}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
