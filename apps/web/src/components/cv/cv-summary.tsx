import type { SummaryData } from '@/lib/cv/types';
import { FileText } from 'lucide-react';

interface CVSummaryProps {
  data: SummaryData;
}

export function CVSummary({ data }: CVSummaryProps) {
  if (!data.content) {
    return null;
  }

  return (
    <div className="space-y-3">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
        <FileText className="w-6 h-6" />
        {data.title || 'Summary'}
      </h2>
      
      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
        {data.content}
      </p>
    </div>
  );
}

