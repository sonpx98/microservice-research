'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Fuse from 'fuse.js';
import { FileText } from 'lucide-react';
import { Post } from 'contentlayer/generated';
import { useTranslations } from 'next-intl';
import { PostCard } from './post-card';
import { Panel } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { ChipGroup } from '@/components/ui/chip-group';
import { SearchDialog } from '@/components/ui/search-dialog';

interface PostListProps {
  posts: Post[];
  tags: string[];
  postsPerPage?: number;
}

export function PostList({ posts, tags, postsPerPage = 6 }: PostListProps) {
  const t = useTranslations('common');
  const tExplore = useTranslations('explore');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(postsPerPage);
  const router = useRouter();
  const fuse = useMemo(
    () =>
      new Fuse(posts, {
        keys: [
          { name: 'title', weight: 0.4 },
          { name: 'excerpt', weight: 0.3 },
          { name: 'tags', weight: 0.3 },
        ],
        threshold: 0.3,
        minMatchCharLength: 2,
      }),
    [posts],
  );

  const filteredPosts = selectedTag
    ? posts.filter(post => post.tags?.includes(selectedTag))
    : posts;

  const currentPosts = filteredPosts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredPosts.length;

  const handleTagChange = (tag: string | null) => {
    setSelectedTag(tag);
    setVisibleCount(postsPerPage);
  };

  const loadMore = () => {
    setVisibleCount(prev => prev + postsPerPage);
  };

  return (
    <div className="space-y-8">
      <Panel>
        <div className="flex flex-col gap-5">
          <SearchDialog<Post>
            placeholder={t('searchPlaceholder')}
            search={(q) => fuse.search(q).slice(0, 8).map((r) => r.item)}
            getKey={(post) => post._id}
            onSelect={(post) => router.push(post.url)}
            renderItem={(post) => (
              <>
                <FileText className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="flex min-w-0 flex-col">
                  <span className="truncate font-medium">{post.title}</span>
                  {post.excerpt && <span className="line-clamp-1 text-xs text-muted-foreground">{post.excerpt}</span>}
                </span>
              </>
            )}
          />
          {tags.length > 0 && (
            <ChipGroup label={t('filterByTag')}>
              <Chip active={selectedTag === null} onClick={() => handleTagChange(null)}>
                {t('allPosts')}
              </Chip>
              {tags.map((tag) => (
                <Chip key={tag} active={selectedTag === tag} onClick={() => handleTagChange(tag)}>
                  {tag}
                </Chip>
              ))}
            </ChipGroup>
          )}
        </div>
      </Panel>

      {/* Posts Grid */}
      {filteredPosts.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">
          {t('noPostsFound')}
        </p>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 items-stretch">
            {currentPosts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>

          {/* Load More Button */}
          {hasMore && (
            <div className="flex justify-center pt-8">
              <Button variant="outline" onClick={loadMore}>
                {tExplore('loadMore')}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
