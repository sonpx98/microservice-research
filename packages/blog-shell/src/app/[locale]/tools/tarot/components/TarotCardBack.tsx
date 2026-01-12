'use client';

import { cn } from "@/lib/utils";

interface TarotCardBackProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

export function TarotCardBack({ size = 'md', className }: TarotCardBackProps) {
  const sizeClasses = {
    xs: 'w-8 h-12 rounded', 
    sm: 'w-12 h-20 rounded',
    md: 'w-24 h-40 rounded-lg',
    lg: 'w-48 h-80 rounded-xl',
  };

  return (
    <div 
      className={cn(
        "relative bg-indigo-950 border-2 border-amber-400 overflow-hidden shadow-lg",
        sizeClasses[size],
        className
      )}
    >
      {/* Decorative Pattern */}
      <div className="absolute inset-1 border border-amber-500/50 rounded-sm opacity-50"></div>
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Star Icon */}
        <svg 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          className="text-amber-400 w-1/2 h-1/2 opacity-80"
          strokeWidth="1.5"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            d="M12 3v18m0-18l-3 6m3-6l3 6m-3 12l-3-6m3 6l3-6M4.5 12h15m-15 0l6-3m-6 3l6 3m9-3l-6-3m6 3l-6 3" 
          />
        </svg>
      </div>
      
      {/* Corner decorations */}
      <div className="absolute top-1 left-1 w-2 h-2 border-t border-l border-amber-400"></div>
      <div className="absolute top-1 right-1 w-2 h-2 border-t border-r border-amber-400"></div>
      <div className="absolute bottom-1 left-1 w-2 h-2 border-b border-l border-amber-400"></div>
      <div className="absolute bottom-1 right-1 w-2 h-2 border-b border-r border-amber-400"></div>
    </div>
  );
}
