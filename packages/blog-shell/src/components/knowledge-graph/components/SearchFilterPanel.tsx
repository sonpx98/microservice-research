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
      <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        {/* Collapsed State - Just Icons */}
        {!isExpanded && (
          <div className="flex items-center gap-2 p-2">
            <button
              onClick={onExpandToggle}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
              title="Expand search"
            >
              <Search className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
            {hasActiveFilter && (
              <div className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-md text-xs font-medium text-blue-700 dark:text-blue-300">
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
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Search & Filter</h3>
              <button
                onClick={onExpandToggle}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                title="Collapse"
              >
                <Minimize2 className="w-3.5 h-3.5 text-gray-500" />
              </button>
            </div>

            {/* Search Input */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search nodes..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-10 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white placeholder-gray-500"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Type Filter Dropdown */}
            <div className="relative">
              <button
                onClick={onFilterToggle}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <span>
                    {typeFilter === 'all' 
                      ? 'All Types' 
                      : typeFilter.charAt(0).toUpperCase() + typeFilter.slice(1)}
                  </span>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {isFilterOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl overflow-hidden z-[100]">
                  {availableTypes.map((type) => (
                    <button
                      key={type}
                      onClick={() => {
                        onTypeFilterChange(type);
                        onFilterToggle();
                      }}
                      className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                        typeFilter === type
                          ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
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
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-xs">
                <span className="text-gray-600 dark:text-gray-400">Results:</span>
                <span className="font-medium text-gray-900 dark:text-white">
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
