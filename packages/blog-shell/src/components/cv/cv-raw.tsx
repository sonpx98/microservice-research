import type { RawData } from '@/lib/cv/types';
import { FileCode } from 'lucide-react';

interface CVRawProps {
  data: RawData;
}

export function CVRaw({ data }: CVRawProps) {
  if (!data.content) {
    return null;
  }

  return (
    <div className="space-y-3">
      {data.title && (
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <FileCode className="w-6 h-6" />
          {data.title}
        </h2>
      )}
      
      <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap text-gray-700 dark:text-gray-300">
        {data.content}
      </div>
    </div>
  );
}
