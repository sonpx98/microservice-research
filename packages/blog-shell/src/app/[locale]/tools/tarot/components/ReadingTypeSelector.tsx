'use client';

import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { readingTypes } from '../data/reading-types';
import { ReadingType } from '../types';
import { cn } from '@/lib/utils';

interface ReadingTypeSelectorProps {
  onSelect: (type: ReadingType) => void;
}

export function ReadingTypeSelector({ onSelect }: ReadingTypeSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto p-4">
      {readingTypes.map((type) => {
        // Map colors to background classes
        const colorClasses = {
          purple: "hover:border-purple-500 hover:shadow-purple-500/20 bg-purple-50/50 dark:bg-purple-900/20",
          pink: "hover:border-pink-500 hover:shadow-pink-500/20 bg-pink-50/50 dark:bg-pink-900/20",
          blue: "hover:border-blue-500 hover:shadow-blue-500/20 bg-blue-50/50 dark:bg-blue-900/20",
          green: "hover:border-green-500 hover:shadow-green-500/20 bg-green-50/50 dark:bg-green-900/20",
          red: "hover:border-red-500 hover:shadow-red-500/20 bg-red-50/50 dark:bg-red-900/20",
          yellow: "hover:border-yellow-500 hover:shadow-yellow-500/20 bg-yellow-50/50 dark:bg-yellow-900/20",
        };

        return (
          <Card 
            key={type.id}
            onClick={() => onSelect(type)}
            className={cn(
              "cursor-pointer transition-all duration-300 hover:scale-105 border-2",
              colorClasses[type.color] || colorClasses.purple
            )}
          >
            <CardHeader>
              <div className="text-4xl mb-4">{type.icon}</div>
              <CardTitle className="text-xl mb-2">{type.title}</CardTitle>
              <CardDescription className="text-base text-gray-600 dark:text-gray-300">
                {type.description}
              </CardDescription>
            </CardHeader>
          </Card>
        );
      })}
    </div>
  );
}
