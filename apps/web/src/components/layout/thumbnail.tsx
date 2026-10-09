'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Newspaper } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ThumbnailProps {
  src?: string;
  alt: string;
  className?: string;
}

/**
 * Cover image with a placeholder when missing or broken.
 * Callers key it by src, so a new image starts from a clean error state.
 */
export function Thumbnail({ src, alt, className }: ThumbnailProps) {
  const [error, setError] = useState(false);

  return (
    <div className={cn('relative flex aspect-video w-full items-center justify-center overflow-hidden bg-muted', className)}>
      {src && !error ? (
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          loading="lazy"
          sizes="(max-width: 768px) 100vw, 400px"
          onError={() => setError(true)}
        />
      ) : (
        <Newspaper className="h-8 w-8 text-muted-foreground/50" />
      )}
    </div>
  );
}
