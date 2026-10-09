import { Post } from 'contentlayer/generated';
import { ContentCard } from '@/components/layout';
import { formatDate } from '@/lib/utils';

export function PostCard({ post }: { post: Post }) {
  return (
    <ContentCard
      href={post.url}
      title={post.title}
      eyebrow={post.readingTime.text}
      image={post.coverImage}
      date={formatDate(post.date, post.locale)}
      excerpt={post.excerpt}
      tags={post.tags}
    />
  );
}
