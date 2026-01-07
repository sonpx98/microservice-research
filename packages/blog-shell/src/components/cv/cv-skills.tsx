import type { SkillsData } from '@/lib/cv/types';
import { Code } from 'lucide-react';

interface CVSkillsProps {
  data: SkillsData;
}

export function CVSkills({ data }: CVSkillsProps) {
  if (!data.categories || data.categories.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
        <Code className="w-6 h-6" />
        {data.title || 'Skills'}
      </h2>
      
      <div className="space-y-3">
        {data.categories.map((category, index) => (
          <div key={index} className="space-y-1.5">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              {category.name}
            </h3>
            <div className="flex flex-wrap gap-2">
              {category.items.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 text-sm bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full border border-blue-200 dark:border-blue-800"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
