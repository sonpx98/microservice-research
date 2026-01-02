import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export function NewsCardSkeleton() {
  return (
    <Card className="h-full flex flex-col border-gray-200 dark:border-gray-800 animate-pulse">
      {/* Thumbnail Skeleton */}
      <div className="rounded-t-xl aspect-video bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700" />
      
      <CardHeader className="p-4">
        {/* Badge and Date Skeleton */}
        <div className="flex justify-between items-start gap-2 mb-2">
          <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
        
        {/* Title Skeleton - 2 lines */}
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
        </div>
      </CardHeader>
      
      <CardContent className="p-4 pt-0">
        {/* Tags Skeleton */}
        <div className="flex flex-wrap gap-1 mt-auto">
          <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
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
          <div className="w-4 h-4 border-2 border-gray-400 border-t-blue-600 rounded-full animate-spin" />
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
