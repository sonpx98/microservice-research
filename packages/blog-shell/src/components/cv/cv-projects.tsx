import type { ProjectsData } from '@/lib/cv/types';
import { ExternalLink } from 'lucide-react';

interface CVProjectsProps {
  data: ProjectsData;
}

export function CVProjects({ data }: CVProjectsProps) {
  // If no structured items but has rawContent, render that
  if ((!data.items || data.items.length === 0) && !data.rawContent) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white border-b-2 border-blue-600 pb-2">
        {data.title || 'Projects'}
      </h2>
      
      {/* Render structured items if available */}
      {data.items && data.items.length > 0 ? (
        <div className="space-y-6">
          {data.items.map((item, index) => (
            <div key={index} className="space-y-2">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {item.name}
                  </h3>
                  {item.link && (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
                
                {item.technologies && item.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {item.technologies.map((tech, i) => (
                      <span
                        key={i}
                        className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {item.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {item.description}
                </p>
              )}

              {item.highlights && item.highlights.length > 0 && (
                <ul className="list-disc list-inside space-y-0.5 text-sm text-gray-600 dark:text-gray-400">
                  {item.highlights.map((highlight, i) => (
                    <li key={i}>{highlight}</li>
                  ))}
                </ul>
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

