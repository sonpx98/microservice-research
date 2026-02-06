'use client';
import { useState, useRef, useLayoutEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { ChevronDown, ChevronUp, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { SearchPanel } from '@/components/ui/search-panel';

interface ReadingSearchFilterProps {
  topics: string[];
  levels: string[];
}

export function ReadingSearchFilter({ topics, levels }: ReadingSearchFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // Collapsible Filters State
  const [isExpanded, setIsExpanded] = useState(false);
  const [showExpandButton, setShowExpandButton] = useState(false);
  
  const tagsRef = useRef<HTMLDivElement>(null);
  
  const activeTopic = searchParams.get('topic') || null;
  const activeLevel = searchParams.get('level') || null;

  // Measure tags height
  useLayoutEffect(() => {
    if (tagsRef.current) {
        setShowExpandButton(tagsRef.current.scrollHeight > 80);
    }
  }, [topics]);
  
  const toggleTopic = (topic: string) => {
    const params = new URLSearchParams(searchParams);
    if (activeTopic === topic) params.delete('topic');
    else params.set('topic', topic);
    router.replace(`${pathname}?${params.toString()}`);
  };

   const toggleLevel = (level: string) => {
    const params = new URLSearchParams(searchParams);
    if (activeLevel === level) params.delete('level');
    else params.set('level', level);
    router.replace(`${pathname}?${params.toString()}`);
  };

  const clearFilters = () => {
     router.push(pathname);
  };

  const handleSearch = async (query: string) => {
     try {
        const res = await fetch(`http://localhost:8080/api/readings?q=${encodeURIComponent(query)}`);
        if (res.ok) {
            const data = await res.json();
            return data.data || [];
        }
     } catch (e) {
         console.error("Search API invalid", e);
     }
     return [];
  };

  const handleSearchAll = (query: string) => {
    const params = new URLSearchParams(searchParams);
    if (query) params.set('q', query);
    else params.delete('q');
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <SearchPanel
        triggerPlaceholder="Search for readings..."
        modalPlaceholder="Search readings..."
        onSearch={handleSearch}
        onSearchAll={handleSearchAll}
        renderResult={(item: any, idx, isActive, close) => (
             <button
                onClick={() => { router.push(`/english-learning/${item._id}`); close(); }}
                className={cn(
                    "w-full text-left px-4 py-3 flex items-start gap-3 transition-colors",
                    isActive ? "bg-blue-50 dark:bg-blue-900/20" : "hover:bg-gray-50 dark:hover:bg-gray-800"
                )}
            >
                <FileText className={cn("w-5 h-5 mt-0.5 flex-shrink-0", isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-400")} />
                <div className="flex-1 min-w-0">
                    <div className={cn("font-medium truncate", isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-900 dark:text-white")}>
                        {item.title}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                        <span className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-xs">{item.level}</span>
                        <span>{item.topic}</span>
                    </div>
                </div>
            </button>
        )}
    >
      <div className="grid md:grid-cols-[1fr_auto] gap-6">
        {/* Filter by Topic */}
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Filter by topic
                </div>
                {showExpandButton && (
                    <button 
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1"
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
                variant={!activeTopic ? "default" : "outline"}
                className={cn(
                "cursor-pointer hover:bg-blue-600 hover:text-white transition-colors px-4 py-1.5 h-auto text-sm",
                !activeTopic ? "bg-blue-600 hover:bg-blue-700 border-transparent shadow-sm" : "text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
                )}
                onClick={() => {
                    const params = new URLSearchParams(searchParams);
                    params.delete('topic');
                    router.replace(`${pathname}?${params.toString()}`);
                }}
            >
                All Topics
            </Badge>
            
            {topics.map((topic) => (
                <Badge
                key={topic}
                variant={activeTopic === topic ? "default" : "outline"}
                className={cn(
                    "cursor-pointer transition-colors px-3 py-1.5 h-auto text-sm font-medium",
                    activeTopic === topic 
                    ? "bg-blue-600 hover:bg-blue-700 border-transparent text-white shadow-sm" 
                    : "text-gray-600 dark:text-gray-300 hover:border-blue-400 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
                )}
                onClick={() => toggleTopic(topic)}
                >
                {topic}
                </Badge>
            ))}
            </div>
        </div>

        {/* Filter by Level */}
         <div className="space-y-3 min-w-[200px]">
            <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Filter by Level
            </div>
            <div className="flex flex-wrap gap-2">
                 {levels.map((level) => (
                    <Badge
                    key={level}
                    variant={activeLevel === level ? "default" : "outline"}
                    className={cn(
                        "cursor-pointer transition-colors px-3 py-1.5 h-auto text-sm font-medium",
                        activeLevel === level 
                        ? "bg-indigo-600 hover:bg-indigo-700 border-transparent text-white shadow-sm" 
                        : "text-gray-600 dark:text-gray-300 hover:border-indigo-400 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
                    )}
                    onClick={() => toggleLevel(level)}
                    >
                    {level}
                    </Badge>
                ))}
            </div>
        </div>
      </div>
      
      {(activeLevel || activeTopic || searchParams.get('q')) && (
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700/50 flex justify-end">
              <button 
                onClick={clearFilters}
                className="text-sm text-red-500 hover:text-red-600 font-medium px-3 py-1 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-md transition-colors"
            >
                Clear all filters
              </button>
          </div>
      )}
    </SearchPanel>
  );
}
