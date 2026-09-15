'use client'

import { useEffect, useState } from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ScrollControlsProps {
  className?: string;
}

export function ScrollControls({ className }: ScrollControlsProps) {
  const [showTop, setShowTop] = useState(false);
  const [showBottom, setShowBottom] = useState(true);

  useEffect(() => {
    const mainElement = document.querySelector('main');
    if (!mainElement) return;

    const handleScroll = () => {
      const scrollY = mainElement.scrollTop;
      const windowHeight = mainElement.clientHeight;
      const documentHeight = mainElement.scrollHeight;

      // Show "Top" if scrolled down a bit
      setShowTop(scrollY > 300);

      // Show "Bottom" if not yet near the bottom
      setShowBottom(scrollY + windowHeight < documentHeight - 100);
    };

    mainElement.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial state

    return () => mainElement.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    const mainElement = document.querySelector('main');
    if (mainElement) {
        mainElement.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const scrollToBottom = () => {
    const mainElement = document.querySelector('main');
    if (mainElement) {
        mainElement.scrollTo({ top: mainElement.scrollHeight, behavior: 'smooth' });
    }
  };

  return (
    <div className={cn("fixed bottom-6 right-6 z-40 flex flex-col gap-3", className)}>
        {/* Scroll To Bottom */}
      <button
        onClick={scrollToBottom}
        className={`p-3 rounded-full bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 shadow-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300 ${
            showBottom ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none absolute'
        }`}
        aria-label="Scroll to bottom"
        title="Scroll to Bottom"
      >
        <ArrowDown className="w-5 h-5" />
      </button>

      {/* Scroll To Top */}
      <button
        onClick={scrollToTop}
        className={`p-3 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition-all duration-300 ${
          showTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
        aria-label="Scroll to top"
        title="Scroll to Top"
      >
        <ArrowUp className="w-5 h-5" />
      </button>
    </div>
  );
}
