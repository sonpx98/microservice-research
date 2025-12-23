'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { Post } from 'contentlayer/generated';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { BookOpen, Calendar, Clock } from 'lucide-react';

import { BlogThumbnail } from './blog-thumbnail';

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const t = useTranslations('explore'); // Reusing 'readNow' from explore namespace for consistency
  const [isExpanded, setIsExpanded] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setIsExpanded(true), 400); // 400ms delay before expanding
  };

  const handleMouseLeave = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setIsExpanded(false), 200);
  };

  return (
    <div 
        className="relative h-full"
        onMouseEnter={handleMouseEnter} 
        onMouseLeave={handleMouseLeave}
    >
      {/* Base Card (Placeholder) */}
      <div className="h-full">
          <Card className="h-full flex flex-col transition-all hover:shadow-lg">
            <BlogThumbnail 
              src={post.coverImage} 
              alt={post.title} 
              className="rounded-t-xl aspect-video object-cover"
            />
            <CardHeader className="flex-shrink-0 p-4">
              <div className="flex justify-between items-start gap-2 mb-2">
                <Badge variant="secondary" className="text-xs font-normal">
                  Blog
                </Badge>
                <time className="text-xs text-gray-500 whitespace-nowrap">
                  {formatDate(post.date, post.locale)}
                </time>
              </div>
              <CardTitle className="line-clamp-2 text-base font-bold leading-tight h-[2.5rem]">{post.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-4 pt-0">
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-auto">
                  {post.tags.slice(0, 2).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs font-normal">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
      </div>

      {/* Expanded Overlay Card (Netflix Style) */}
      {isExpanded && (
          <div className="absolute top-[-10%] left-[-10%] w-[120%] z-50 animate-in fade-in zoom-in-95 duration-200">
               <Link href={post.url} className="block">
                  <Card className="shadow-2xl border-gray-200 dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-900 border-0 ring-1 ring-black/5 dark:ring-white/10">
                      {/* Cinematic Image */}
                      <div className="relative h-48 w-full">
                          <BlogThumbnail 
                              src={post.coverImage} 
                              alt={post.title} 
                              className="h-full w-full object-cover"
                          />
                          {/* Gradient Overlay */}
                          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent" />
                          
                          <div className="absolute bottom-3 left-4 right-4">
                               <h4 className="font-bold text-lg leading-tight text-white drop-shadow-sm line-clamp-2">
                                  {post.title}
                              </h4>
                          </div>
                      </div>

                      <div className="p-4 space-y-3">
                          {/* Buttons */}
                          <div className="flex gap-2">
                              <Button className="w-full h-8 text-xs font-semibold gap-2" size="sm">
                                  <BookOpen className="w-3.5 h-3.5" />
                                  {t('readNow')}
                              </Button>
                          </div>

                          {/* Meta Info */}
                          <div className="flex items-center gap-3 text-xs font-medium text-gray-500 dark:text-gray-400">
                              <span className="text-gray-900 dark:text-gray-200">Blog</span>
                              <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {post.date ? new Date(post.date).getFullYear() : '2025'}
                              </span>
                              <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {post.readingTime.text}
                              </span>
                          </div>

                          {/* Tags */}
                          {post.tags && post.tags.length > 0 && (
                               <div className="flex flex-wrap gap-1.5">
                                  {post.tags.slice(0, 3).map((tag, tIdx) => (
                                      <span key={`${tag}-${tIdx}`} className="text-xs text-gray-500 dark:text-gray-400">
                                          {tIdx > 0 && '•'} {tag}
                                      </span>
                                  ))}
                              </div>
                          )}
                          
                          {/* Description */}
                          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-3 leading-relaxed">
                                {post.excerpt}
                          </p>
                      </div>
                  </Card>
               </Link>
          </div>
      )}
    </div>
  );
}
