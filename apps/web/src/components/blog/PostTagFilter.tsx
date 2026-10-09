'use client';

import { useRef, useLayoutEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PostTagFilterProps {
  tags: string[];
  selectedTag: string | null;
  onTagChange: (tag: string | null) => void;
}

export function PostTagFilter({ tags, selectedTag, onTagChange }: PostTagFilterProps) {
  const t = useTranslations('common');
  const [isExpanded, setIsExpanded] = useState(false);
  const [showExpandButton, setShowExpandButton] = useState(false);
  const tagsRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (tagsRef.current) {
      setShowExpandButton(tagsRef.current.scrollHeight > 80);
    }
  }, [tags]);

  if (tags.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground">
          {t('filterByTag')}
        </h3>
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
        <button
          onClick={() => onTagChange(null)}
          className={`px-3 py-1.5 text-sm rounded-full transition-all ${
            selectedTag === null
              ? 'bg-primary text-primary-foreground shadow-md'
              : 'bg-card text-muted-foreground border border-border hover:border-primary/30'
          }`}
        >
          {t('allPosts')}
        </button>
        {tags.map((tag) => (
          <button
            key={tag}
            onClick={() => onTagChange(tag)}
            className={`px-3 py-1.5 text-sm rounded-full transition-all ${
              selectedTag === tag
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'bg-card text-muted-foreground border border-border hover:border-primary/30'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
}
