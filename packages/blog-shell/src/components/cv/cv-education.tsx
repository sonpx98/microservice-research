import type { EducationData } from '@/lib/cv/types';
import { formatDateRange } from '@/lib/cv/utils';

interface CVEducationProps {
  data: EducationData;
}

export function CVEducation({ data }: CVEducationProps) {
  // If no structured items but has rawContent, render that
  if ((!data.items || data.items.length === 0) && !data.rawContent) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white border-b-2 border-blue-600 pb-2">
        {data.title || 'Education'}
      </h2>
      
      {/* Render structured items if available */}
      {data.items && data.items.length > 0 ? (
        <div className="space-y-6">
          {data.items.map((item, index) => (
            <div key={index} className="space-y-2">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {item.degree} in {item.field}
                </h3>
                <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2 flex-wrap">
                  <span className="font-medium">{item.institution}</span>
                  {item.location && (
                    <>
                      <span>•</span>
                      <span>{item.location}</span>
                    </>
                  )}
                  <span>•</span>
                  <span>{formatDateRange(item.startDate, item.endDate)}</span>
                </div>
              </div>

              {item.gpa && (
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-semibold">GPA:</span> {item.gpa}
                </p>
              )}

              {item.honors && item.honors.length > 0 && (
                <div className="text-sm">
                  <p className="font-semibold text-gray-700 dark:text-gray-300 mb-1">Honors:</p>
                  <ul className="list-disc list-inside space-y-0.5 text-gray-600 dark:text-gray-400">
                    {item.honors.map((honor, i) => (
                      <li key={i}>{honor}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        /* Render raw content as fallback */
        <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap text-gray-700 dark:text-gray-300">
          {data.rawContent}
        </div>
      )}
    </div>
  );
}

