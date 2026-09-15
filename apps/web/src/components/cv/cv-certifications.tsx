import type { CertificationsData } from '@/lib/cv/types';
import { ExternalLink } from 'lucide-react';

interface CVCertificationsProps {
  data: CertificationsData;
}

export function CVCertifications({ data }: CVCertificationsProps) {
  // If no structured items but has rawContent, render that
  if ((!data.items || data.items.length === 0) && !data.rawContent) return null;

  const formatDate = (dateStr: string) => {
    const [year, month] = dateStr.split('-');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white border-b-2 border-blue-600 pb-2">
        {data.title || 'Certifications'}
      </h2>
      
      {/* Render structured items if available */}
      {data.items && data.items.length > 0 ? (
        <div className="space-y-4">
          {data.items.map((item, index) => (
            <div key={index} className="space-y-1">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                    {item.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {item.issuer}
                  </p>
                </div>
                {item.link && (
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline flex-shrink-0"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
              
              <div className="text-sm text-gray-500 dark:text-gray-500 flex items-center gap-2">
                <span>{formatDate(item.date)}</span>
                {item.credentialId && (
                  <>
                    <span>•</span>
                    <span className="font-mono text-xs">ID: {item.credentialId}</span>
                  </>
                )}
              </div>
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

