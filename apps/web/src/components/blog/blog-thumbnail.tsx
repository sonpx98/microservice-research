'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Image as ImageIcon, Newspaper } from 'lucide-react';

interface BlogThumbnailProps {
  src?: string;
  alt: string;
  className?: string;
}

export function BlogThumbnail({ src, alt, className = '' }: BlogThumbnailProps) {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Reset state when src changes
  useEffect(() => {
    setError(false);
    setLoaded(false);
  }, [src]);

  if (!src || error) {
    return (
      <div className={`w-full h-48 bg-muted flex items-center justify-center ${className}`}>
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
           <Newspaper className="w-8 h-8 opacity-50" />
           <span className="text-xs font-medium opacity-50 uppercase tracking-wider">No Image</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full h-48 relative overflow-hidden bg-muted ${className}`}>
        <Image
            src={src}
            alt={alt}
            fill
            className="object-cover"
            loading="lazy"
            sizes="(max-width: 768px) 100vw, 400px"
            onError={() => setError(true)}
        />
    </div>
  );
}
