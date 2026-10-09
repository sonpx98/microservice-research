'use client'

import { useEffect, useState } from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Fab } from '@/components/ui/floating';

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
      <Fab
        onClick={scrollToBottom}
        className={cn('duration-300', showBottom ? 'opacity-100' : 'pointer-events-none absolute translate-y-4 opacity-0')}
        aria-label="Scroll to bottom"
        title="Scroll to bottom"
      >
        <ArrowDown />
      </Fab>

      {/* Scroll To Top */}
      <Fab
        variant="primary"
        onClick={scrollToTop}
        className={cn('duration-300', showTop ? 'opacity-100' : 'pointer-events-none translate-y-4 opacity-0')}
        aria-label="Scroll to top"
        title="Scroll to top"
      >
        <ArrowUp />
      </Fab>
    </div>
  );
}
