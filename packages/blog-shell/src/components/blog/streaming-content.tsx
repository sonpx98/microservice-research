'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Sparkles } from 'lucide-react';
import { streamingEvents, STREAMING_EVENTS } from '@/lib/streaming-events';

interface StreamingContentProps {
  html: string;
  enabled?: boolean;
  charsPerTick?: number;
  tickInterval?: number;
}

// Check if device is low-powered or prefers reduced motion
function shouldDisableAnimation(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Respect user's reduced motion preference
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return true;
  }
  
  // Check for low-end device indicators
  const connection = (navigator as any).connection;
  if (connection) {
    // Slow connection = likely mobile/low-end
    if (connection.saveData || connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
      return true;
    }
  }
  
  // Check hardware concurrency (CPU cores)
  if (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2) {
    return true;
  }
  
  // Check device memory (if available)
  if ((navigator as any).deviceMemory && (navigator as any).deviceMemory < 4) {
    return true;
  }
  
  return false;
}

export function StreamingContent({ 
  html, 
  enabled = true,
  charsPerTick = 8,
  tickInterval = 20,
}: StreamingContentProps) {
  const [displayedLength, setDisplayedLength] = useState(0);
  const [isStreaming, setIsStreaming] = useState(false);
  const [showSkipButton, setShowSkipButton] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const currentHtmlRef = useRef<string>('');

  // Reset when html changes (new post)
  useEffect(() => {
    // Clean up previous interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    // Reset state for new content
    setDisplayedLength(0);
    currentHtmlRef.current = html;
    
    const disabled = !enabled || shouldDisableAnimation();
    setIsDisabled(disabled);
    
    if (disabled) {
      setDisplayedLength(html.length);
      setIsStreaming(false);
      setShowSkipButton(false);
    } else {
      setIsStreaming(true);
      setShowSkipButton(true);
      
      // Start streaming after delay
      const startTimeout = setTimeout(() => {
        intervalRef.current = setInterval(() => {
          setDisplayedLength(prev => {
            const randomChars = charsPerTick + Math.floor(Math.random() * 4) - 2;
            const next = prev + Math.max(1, randomChars);
            
            if (next >= currentHtmlRef.current.length) {
              if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
              }
              // Use setTimeout to ensure state updates happen outside the interval callback
              setTimeout(() => {
                setIsStreaming(false);
                setShowSkipButton(false);
              }, 0);
              return currentHtmlRef.current.length;
            }
            return next;
          });
        }, tickInterval);
      }, 500);
      
      return () => {
        clearTimeout(startTimeout);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };
    }
  }, [html, enabled, charsPerTick, tickInterval]);

  const handleSkip = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setDisplayedLength(html.length);
    setIsStreaming(false);
    setShowSkipButton(false);
    // Emit event so other components know animation is done
    streamingEvents.emit(STREAMING_EVENTS.ANIMATION_COMPLETE);
  }, [html.length]);

  // Listen for external skip requests (e.g., from bookmark resume)
  useEffect(() => {
    const unsubscribe = streamingEvents.on(STREAMING_EVENTS.SKIP_ANIMATION, () => {
      handleSkip();
    });
    return unsubscribe;
  }, [handleSkip]);

  // Memoize visible HTML calculation
  const visibleHtml = useMemo(() => {
    if (displayedLength >= html.length) return html;
    
    let visible = html.slice(0, displayedLength);
    
    // Ensure we don't cut in the middle of an HTML tag
    const lastOpenTag = visible.lastIndexOf('<');
    const lastCloseTag = visible.lastIndexOf('>');
    
    if (lastOpenTag > lastCloseTag) {
      const tagEnd = html.indexOf('>', lastOpenTag);
      if (tagEnd !== -1) {
        visible = html.slice(0, tagEnd + 1);
      }
    }
    
    return visible;
  }, [html, displayedLength]);

  return (
    <div className="relative">
      {/* Skip button */}
      {showSkipButton && (
        <div className="sticky top-20 z-10 flex justify-end mb-4">
          <button
            onClick={handleSkip}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors shadow-lg"
          >
            <Sparkles className="w-4 h-4 text-purple-500" />
            <span>Skip animation</span>
          </button>
        </div>
      )}

      {/* Content */}
      <div 
        className="prose prose-lg dark:prose-invert max-w-none prose-headings:scroll-mt-20 prose-pre:bg-transparent prose-pre:p-0"
        dangerouslySetInnerHTML={{ __html: visibleHtml }}
      />

      {/* Streaming cursor */}
      {isStreaming && (
        <span className="inline-flex items-center gap-2 mt-1">
          <span className="w-2 h-5 bg-purple-500 animate-pulse" />
        </span>
      )}
    </div>
  );
}
