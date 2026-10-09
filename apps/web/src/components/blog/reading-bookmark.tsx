'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Bookmark, BookmarkCheck, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Fab, FloatingCard } from '@/components/ui/floating';
import { streamingEvents, STREAMING_EVENTS } from '@/lib/streaming-events';

interface ReadingBookmarkProps {
  slug: string;
  locale: string;
}

interface BookmarkData {
  slug: string;
  locale: string;
  scrollPosition: number;
  scrollPercentage: number;
  lastRead: string;
  title?: string;
}

const STORAGE_KEY = 'blog-reading-bookmarks';

// Get all bookmarks from localStorage
function getBookmarks(): Record<string, BookmarkData> {
  if (typeof window === 'undefined') return {};
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

// Save bookmark to localStorage
function saveBookmark(bookmark: BookmarkData) {
  if (typeof window === 'undefined') return;
  try {
    const bookmarks = getBookmarks();
    const key = `${bookmark.locale}:${bookmark.slug}`;
    bookmarks[key] = bookmark;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
  } catch (e) {
    console.error('Failed to save bookmark:', e);
  }
}

// Get bookmark for specific post
function getBookmark(slug: string, locale: string): BookmarkData | null {
  const bookmarks = getBookmarks();
  const key = `${locale}:${slug}`;
  return bookmarks[key] || null;
}

// Remove bookmark
function removeBookmark(slug: string, locale: string) {
  if (typeof window === 'undefined') return;
  try {
    const bookmarks = getBookmarks();
    const key = `${locale}:${slug}`;
    delete bookmarks[key];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
  } catch (e) {
    console.error('Failed to remove bookmark:', e);
  }
}

export function ReadingBookmark({ slug, locale }: ReadingBookmarkProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [currentPercentage, setCurrentPercentage] = useState(0);
  const [displayPercentage, setDisplayPercentage] = useState<number | null>(null); // For display only
  const [showResumePrompt, setShowResumePrompt] = useState(false);
  const [savedBookmark, setSavedBookmark] = useState<BookmarkData | null>(null);
  const hasRestoredRef = useRef(false);
  const hasUserScrolledRef = useRef(false);

  // Check for existing bookmark on mount
  useEffect(() => {
    const bookmark = getBookmark(slug, locale);
    if (bookmark && !hasRestoredRef.current) {
      setSavedBookmark(bookmark);
      setIsBookmarked(true);
      // Show saved percentage until user scrolls
      setDisplayPercentage(bookmark.scrollPercentage);
      
      // Show resume prompt if they were more than 10% into the article
      if (bookmark.scrollPercentage > 10) {
        setShowResumePrompt(true);
      }
    }
  }, [slug, locale]);

  // Track scroll position and auto-save bookmark
  useEffect(() => {
    let saveTimeout: NodeJS.Timeout | null = null;
    
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const percentage = docHeight > 0 ? Math.round((scrollTop / docHeight) * 100) : 0;
      setCurrentPercentage(percentage);
      
      // Once user scrolls, switch to real-time percentage
      if (scrollTop > 10) {
        hasUserScrolledRef.current = true;
        setDisplayPercentage(null); // Use currentPercentage instead
      }
      
      // Auto-save bookmark while scrolling (debounced)
      if (isBookmarked && hasUserScrolledRef.current) {
        if (saveTimeout) clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => {
          const title = document.querySelector('article h1')?.textContent || '';
          saveBookmark({
            slug,
            locale,
            scrollPosition: window.scrollY,
            scrollPercentage: percentage,
            lastRead: new Date().toISOString(),
            title,
          });
        }, 500); // Save after 500ms of no scrolling
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial calculation

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (saveTimeout) clearTimeout(saveTimeout);
    };
  }, [isBookmarked, slug, locale]);

  // Auto-save position when leaving page (if bookmarked)
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isBookmarked && currentPercentage > 0) {
        const title = document.querySelector('article h1')?.textContent || '';
        saveBookmark({
          slug,
          locale,
          scrollPosition: window.scrollY,
          scrollPercentage: currentPercentage,
          lastRead: new Date().toISOString(),
          title,
        });
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isBookmarked, currentPercentage, slug, locale]);

  const handleBookmark = useCallback(() => {
    if (isBookmarked) {
      // Remove bookmark
      removeBookmark(slug, locale);
      setIsBookmarked(false);
      setSavedBookmark(null);
    } else {
      // Add bookmark
      const title = document.querySelector('article h1')?.textContent || '';
      const bookmark: BookmarkData = {
        slug,
        locale,
        scrollPosition: window.scrollY,
        scrollPercentage: currentPercentage,
        lastRead: new Date().toISOString(),
        title,
      };
      saveBookmark(bookmark);
      setIsBookmarked(true);
      setSavedBookmark(bookmark);
    }
  }, [isBookmarked, slug, locale, currentPercentage]);

  const handleResume = useCallback(() => {
    if (savedBookmark) {
      hasRestoredRef.current = true;
      setShowResumePrompt(false);
      
      // Skip streaming animation first, then scroll after a short delay
      streamingEvents.emit(STREAMING_EVENTS.SKIP_ANIMATION);
      
      // Wait for content to be fully rendered before scrolling
      setTimeout(() => {
        window.scrollTo({
          top: savedBookmark.scrollPosition,
          behavior: 'smooth',
        });
      }, 100);
    }
  }, [savedBookmark]);

  const handleStartOver = useCallback(() => {
    hasRestoredRef.current = true;
    setShowResumePrompt(false);
    
    // Skip streaming animation first
    streamingEvents.emit(STREAMING_EVENTS.SKIP_ANIMATION);
    
    // Already at top, but ensure smooth experience
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  }, []);

  return (
    <>
      {/* Resume reading prompt */}
      {showResumePrompt && savedBookmark && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
          <FloatingCard className="max-w-sm">
            <div className="flex items-start gap-3">
              <Bookmark className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">Continue reading?</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  You were {savedBookmark.scrollPercentage}% through this article
                </p>
                <div className="mt-3 flex gap-2">
                  <Button size="sm" className="flex-1" onClick={handleResume}>
                    Resume
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1" onClick={handleStartOver}>
                    Start over
                  </Button>
                </div>
              </div>
              <Button size="icon-sm" variant="ghost" aria-label="Dismiss" onClick={() => setShowResumePrompt(false)}>
                <X />
              </Button>
            </div>
          </FloatingCard>
        </div>
      )}

      {/* Floating bookmark button */}
      <Fab
        variant={isBookmarked ? 'primary' : 'surface'}
        onClick={handleBookmark}
        className="fixed right-6 bottom-6 z-40"
        aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark this position'}
        title={isBookmarked ? 'Remove bookmark' : 'Bookmark this position'}
      >
        {isBookmarked ? <BookmarkCheck /> : <Bookmark />}
      </Fab>

      {/* Current position indicator (when bookmarked) */}
      {isBookmarked && (
        <div className="fixed right-6 bottom-20 z-40 rounded-full border border-border bg-popover px-2 py-1 font-mono text-xs text-muted-foreground">
          {displayPercentage !== null ? displayPercentage : currentPercentage}%
        </div>
      )}
    </>
  );
}
