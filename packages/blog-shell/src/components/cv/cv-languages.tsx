import type { LanguagesData } from '@/lib/cv/types';

interface CVLanguagesProps {
  data: LanguagesData;
}

export function CVLanguages({ data }: CVLanguagesProps) {
  if (!data.items || data.items.length === 0) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white border-b-2 border-blue-600 pb-2">
        {data.title || 'Languages'}
      </h2>
      
      <div className="grid grid-cols-2 gap-3">
        {data.items.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {item.language}
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {item.proficiency}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
