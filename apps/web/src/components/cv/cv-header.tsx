import type { HeaderData } from '@/lib/cv/types';
import { Mail, Phone, MapPin, ExternalLink } from 'lucide-react';

interface CVHeaderProps {
  data: HeaderData;
}

export function CVHeader({ data }: CVHeaderProps) {
  return (
    <div className="space-y-3">
      {/* Name */}
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
        {data.name}
      </h1>
      
      {/* Title */}
      {data.title && (
        <p className="text-xl font-medium text-gray-600 dark:text-gray-300">
          {data.title}
        </p>
      )}
      
      {/* Contact Info */}
      <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
        {data.email && (
          <div className="flex items-center gap-1.5">
            <Mail className="w-4 h-4" />
            <a 
              href={`mailto:${data.email}`}
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              {data.email}
            </a>
          </div>
        )}
        
        {data.phone && (
          <div className="flex items-center gap-1.5">
            <Phone className="w-4 h-4" />
            <a 
              href={`tel:${data.phone}`}
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              {data.phone}
            </a>
          </div>
        )}
        
        {data.location && (
          <div className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4" />
            <span>{data.location}</span>
          </div>
        )}
      </div>
      
      {/* Links */}
      {data.links && data.links.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {data.links.map((link, index) => (
            <a
              key={index}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              {link.label || link.type}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
