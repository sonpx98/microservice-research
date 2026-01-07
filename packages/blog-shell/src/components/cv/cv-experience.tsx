import type { ExperienceData } from '@/lib/cv/types';
import { formatDateRange } from '@/lib/cv/utils';
import { Briefcase } from 'lucide-react';

interface CVExperienceProps {
  data: ExperienceData;
}

export function CVExperience({ data }: CVExperienceProps) {
  if (!data.items || data.items.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
        <Briefcase className="w-6 h-6" />
        {data.title || 'Experience'}
      </h2>
      
      <div className="space-y-6">
        {data.items.map((item, index) => (
          <div key={index} className="space-y-2">
            {/* Position & Company */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {item.position}
              </h3>
              <p className="text-base font-medium text-gray-700 dark:text-gray-300">
                {item.company}
              </p>
            </div>
            
            {/* Location & Date */}
            <div className="flex flex-wrap gap-2 text-sm text-gray-600 dark:text-gray-400">
              {item.location && <span>{item.location}</span>}
              <span>•</span>
              <span>{formatDateRange(item.startDate, item.endDate)}</span>
            </div>
            
            {/* Highlights */}
            {item.highlights && item.highlights.length > 0 && (
              <ul className="space-y-1.5 mt-3">
                {item.highlights.map((highlight, idx) => (
                  <li 
                    key={idx}
                    className="text-sm text-gray-700 dark:text-gray-300 flex gap-2"
                  >
                    <span className="text-blue-600 dark:text-blue-400 mt-1.5">•</span>
                    <span className="flex-1">{highlight}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
