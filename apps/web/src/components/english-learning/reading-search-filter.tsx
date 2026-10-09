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
        const res = await fetch(`${process.env.NEXT_PUBLIC_GATEWAY_URL || 'http://localhost:3000/api'}/readings?q=${encodeURIComponent(query)}`);
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
                    isActive ? "bg-primary/10" : "hover:bg-muted"
                )}
            >
                <FileText className={cn("w-5 h-5 mt-0.5 flex-shrink-0", isActive ? "text-primary" : "text-muted-foreground")} />
                <div className="flex-1 min-w-0">
                    <div className={cn("font-medium truncate", isActive ? "text-primary" : "text-foreground")}>
                        {item.title}
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                        <span className="bg-muted px-1.5 py-0.5 rounded text-xs">{item.level}</span>
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
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Filter by topic
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
                variant={!activeTopic ? "default" : "outline"}
                className={cn(
                "cursor-pointer hover:bg-primary/90 hover:text-primary-foreground transition-colors px-4 py-1.5 h-auto text-sm",
                !activeTopic ? "bg-primary hover:bg-primary/90 border-transparent shadow-sm" : "text-muted-foreground border-border bg-card"
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
                    ? "bg-primary hover:bg-primary/90 border-transparent text-primary-foreground shadow-sm" 
                    : "text-muted-foreground hover:border-primary hover:text-primary border-border bg-card"
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
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
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
                        ? "bg-primary hover:bg-primary/90 border-transparent text-primary-foreground shadow-sm" 
                        : "text-muted-foreground hover:border-primary hover:text-primary border-border bg-card"
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
          <div className="pt-4 border-t border-border flex justify-end">
              <button 
                onClick={clearFilters}
                className="text-sm text-danger hover:text-danger font-medium px-3 py-1 hover:bg-danger/10 rounded-md transition-colors"
            >
                Clear all filters
              </button>
          </div>
      )}
    </SearchPanel>
  );
}
