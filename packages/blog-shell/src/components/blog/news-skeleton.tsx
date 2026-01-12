import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export function NewsCardSkeleton() {
  return (
    <Card className="h-full flex flex-col border-gray-200 dark:border-gray-800">
      {/* Thumbnail Skeleton */}
      <Skeleton className="rounded-t-xl aspect-video" />
      
      <CardHeader className="p-4">
        {/* Badge and Date Skeleton */}
        <div className="flex justify-between items-start gap-2 mb-2">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-4 w-20" />
        </div>
        
        {/* Title Skeleton - 2 lines */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </CardHeader>
      
      <CardContent className="p-4 pt-0">
        {/* Tags Skeleton */}
        <div className="flex flex-wrap gap-1 mt-auto">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-20" />
        </div>
      </CardContent>
    </Card>
  );
}

export function NewsListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="space-y-8">
      {/* Loading Message */}
      <div className="text-center py-4">
        <div className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <LoadingSpinner size="sm" className="text-blue-600" />
          <span>Loading fresh content from Gateway...</span>
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
          This may take up to 60 seconds if the server is waking up
        </p>
      </div>
      
      {/* Skeleton Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: count }).map((_, idx) => (
          <NewsCardSkeleton key={idx} />
        ))}
      </div>
    </div>
  );
}
