import Link from 'next/link';
import { Post } from 'contentlayer/generated';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';
import { useTranslations } from 'next-intl';

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const t = useTranslations('common');

  return (
    <Link href={post.url} className="h-full">
      <Card className="h-full flex flex-col transition-all hover:shadow-lg">
        <CardHeader className="flex-shrink-0">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
            <time dateTime={post.date}>
              {formatDate(post.date, post.locale)}
            </time>
            <span>•</span>
            <span>{post.readingTime.text}</span>
          </div>
          <CardTitle className="line-clamp-2">{post.title}</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          <p className="text-gray-600 dark:text-gray-400 line-clamp-3 mb-4 flex-1">
            {post.excerpt}
          </p>
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-auto">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
