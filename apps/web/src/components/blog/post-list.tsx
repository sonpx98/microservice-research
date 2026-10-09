'use client';

import { useState, useEffect } from 'react';
import { Post } from 'contentlayer/generated';
import { PostCard } from './post-card';
import { PostSearchModal } from './PostSearchModal';
import { PostTagFilter } from './PostTagFilter';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';
import { Search } from 'lucide-react';

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
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Keyboard shortcut (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

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
      {/* Search & Filter Section */}
      <div className="bg-muted rounded-xl p-6 space-y-5">
        {/* Search Bar */}
        <button
          onClick={() => setIsSearchOpen(true)}
          className="w-full flex items-center gap-3 px-4 py-3 text-left text-muted-foreground bg-card rounded-lg hover:bg-muted transition-colors border border-border shadow-sm"
        >
          <Search className="w-5 h-5" />
          <span className="flex-1">{t('searchPlaceholder')}</span>
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs font-mono text-muted-foreground bg-muted rounded border border-border">
            ⌘K
          </kbd>
        </button>

        {/* Tags Filter */}
        <PostTagFilter
          tags={tags}
          selectedTag={selectedTag}
          onTagChange={handleTagChange}
        />
      </div>

      {/* Search Modal */}
      <PostSearchModal
        posts={posts}
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

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
              <Button
                variant="outline"
                onClick={loadMore}
                className="rounded-full"
              >
                {tExplore('loadMore')}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
