'use client';

import { useState } from 'react';
import { Post } from 'contentlayer/generated';
import { PostCard } from './post-card';
import { Badge } from '@/components/ui/badge';
import { useTranslations } from 'next-intl';

interface PostListProps {
  posts: Post[];
  tags: string[];
}

export function PostList({ posts, tags }: PostListProps) {
  const t = useTranslations('common');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const filteredPosts = selectedTag
    ? posts.filter(post => post.tags?.includes(selectedTag))
    : posts;

  return (
    <div className="space-y-8">
      {tags.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">{t('filterByTag')}</h3>
          <div className="flex flex-wrap gap-2">
            <Badge
              variant={selectedTag === null ? 'default' : 'secondary'}
              className="cursor-pointer"
              onClick={() => setSelectedTag(null)}
            >
              {t('allPosts')}
            </Badge>
            {tags.map((tag) => (
              <Badge
                key={tag}
                variant={selectedTag === tag ? 'default' : 'secondary'}
                className="cursor-pointer"
                onClick={() => setSelectedTag(tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {filteredPosts.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400 py-12">
          {t('noPostsFound')}
        </p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 items-stretch">
          {filteredPosts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
