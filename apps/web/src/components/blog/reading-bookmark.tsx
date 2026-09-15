'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Bookmark, BookmarkCheck, ChevronUp } from 'lucide-react';
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
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 max-w-sm">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                <Bookmark className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 dark:text-white text-sm">
                  Continue reading?
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  You were {savedBookmark.scrollPercentage}% through this article
                </p>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={handleResume}
                    className="flex-1 px-3 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    Resume
                  </button>
                  <button
                    onClick={handleStartOver}
                    className="flex-1 px-3 py-1.5 text-xs font-medium bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                  >
                    Start over
                  </button>
                </div>
              </div>
              <button
                onClick={() => setShowResumePrompt(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating bookmark button */}
      <button
        onClick={handleBookmark}
        className={`fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 ${
          isBookmarked
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 border border-gray-200 dark:border-gray-700'
        }`}
        title={isBookmarked ? 'Remove bookmark' : 'Bookmark this position'}
      >
        {isBookmarked ? (
          <BookmarkCheck className="w-5 h-5" />
        ) : (
          <Bookmark className="w-5 h-5" />
        )}
      </button>

      {/* Current position indicator (when bookmarked) */}
      {isBookmarked && (
        <div className="fixed bottom-20 right-6 z-40 text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-2 py-1 rounded-full shadow border border-gray-200 dark:border-gray-700">
          {displayPercentage !== null ? displayPercentage : currentPercentage}%
        </div>
      )}
    </>
  );
}
