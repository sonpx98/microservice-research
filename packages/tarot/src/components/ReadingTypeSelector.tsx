import { useState } from 'react';
import type { ReadingType } from '../data/readingTypes';
import { readingTypes } from '../data/readingTypes';

interface ReadingTypeSelectorProps {
  onSelect: (readingType: ReadingType) => void;
}

export function ReadingTypeSelector({ onSelect }: ReadingTypeSelectorProps) {
  const [selectedType, setSelectedType] = useState<string>('');

  const getColorClasses = (color: string, isSelected: boolean) => {
    const baseClasses = {
      purple: isSelected 
        ? 'tw:bg-purple-100 tw:dark:bg-purple-900/30 tw:border-purple-500 tw:dark:border-purple-400 tw:text-purple-800 tw:dark:text-purple-300' 
        : 'tw:bg-white tw:dark:bg-gray-800 tw:border-purple-200 tw:dark:border-purple-700 tw:text-purple-600 tw:dark:text-purple-400 hover:tw:bg-purple-50 tw:dark:hover:bg-purple-900/20',
      pink: isSelected 
        ? 'tw:bg-pink-100 tw:dark:bg-pink-900/30 tw:border-pink-500 tw:dark:border-pink-400 tw:text-pink-800 tw:dark:text-pink-300' 
        : 'tw:bg-white tw:dark:bg-gray-800 tw:border-pink-200 tw:dark:border-pink-700 tw:text-pink-600 tw:dark:text-pink-400 hover:tw:bg-pink-50 tw:dark:hover:bg-pink-900/20',
      blue: isSelected 
        ? 'tw:bg-blue-100 tw:dark:bg-blue-900/30 tw:border-blue-500 tw:dark:border-blue-400 tw:text-blue-800 tw:dark:text-blue-300' 
        : 'tw:bg-white tw:dark:bg-gray-800 tw:border-blue-200 tw:dark:border-blue-700 tw:text-blue-600 tw:dark:text-blue-400 hover:tw:bg-blue-50 tw:dark:hover:bg-blue-900/20',
      green: isSelected 
        ? 'tw:bg-green-100 tw:dark:bg-green-900/30 tw:border-green-500 tw:dark:border-green-400 tw:text-green-800 tw:dark:text-green-300' 
        : 'tw:bg-white tw:dark:bg-gray-800 tw:border-green-200 tw:dark:border-green-700 tw:text-green-600 tw:dark:text-green-400 hover:tw:bg-green-50 tw:dark:hover:bg-green-900/20',
      red: isSelected 
        ? 'tw:bg-red-100 tw:dark:bg-red-900/30 tw:border-red-500 tw:dark:border-red-400 tw:text-red-800 tw:dark:text-red-300' 
        : 'tw:bg-white tw:dark:bg-gray-800 tw:border-red-200 tw:dark:border-red-700 tw:text-red-600 tw:dark:text-red-400 hover:tw:bg-red-50 tw:dark:hover:bg-red-900/20',
      yellow: isSelected 
        ? 'tw:bg-yellow-100 tw:dark:bg-yellow-900/30 tw:border-yellow-500 tw:dark:border-yellow-400 tw:text-yellow-800 tw:dark:text-yellow-300' 
        : 'tw:bg-white tw:dark:bg-gray-800 tw:border-yellow-200 tw:dark:border-yellow-700 tw:text-yellow-600 tw:dark:text-yellow-400 hover:tw:bg-yellow-50 tw:dark:hover:bg-yellow-900/20'
    };
    return baseClasses[color as keyof typeof baseClasses];
  };

  const handleSelect = (type: ReadingType) => {
    setSelectedType(type.id);
    setTimeout(() => {
      onSelect(type);
    }, 300);
  };

  return (
    <div className="tw:max-w-4xl tw:mx-auto tw:px-4">
      <div className="tw:text-center tw:mb-8">
        <h2 className="tw:text-3xl tw:font-bold tw:text-purple-800 tw:dark:text-purple-300 tw:mb-3">
          Chọn Loại Tarot Reading
        </h2>
        <p className="tw:text-gray-600 tw:dark:text-gray-300 tw:text-lg">
          Bạn muốn khám phá điều gì qua những lá bài tarot huyền bí?
        </p>
      </div>

      <div className="tw:grid tw:grid-cols-1 sm:tw:grid-cols-2 lg:tw:grid-cols-3 tw:gap-4 tw:mb-8">
        {readingTypes.map((type) => {
          const isSelected = selectedType === type.id;
          return (
            <div
              key={type.id}
              onClick={() => handleSelect(type)}
              className={`
                tw:p-6 tw:rounded-xl tw:border-2 tw:cursor-pointer tw:transition-all tw:duration-300
                tw:transform hover:tw:scale-105 tw:shadow-lg hover:tw:shadow-xl
                ${getColorClasses(type.color, isSelected)}
                ${isSelected ? 'tw:scale-105' : ''}
              `}
            >
              <div className="tw:text-center">
                <div className="tw:text-4xl tw:mb-3">
                  {type.icon}
                </div>
                <h3 className="tw:text-xl tw:font-bold tw:mb-2">
                  {type.title}
                </h3>
                <p className="tw:text-sm tw:opacity-80">
                  {type.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="tw:text-center">
        <p className="tw:text-sm tw:text-gray-500 tw:dark:text-gray-400 tw:max-w-2xl tw:mx-auto">
          ✨ Mỗi loại reading sẽ có cách giải thích khác nhau phù hợp với chủ đề bạn quan tâm. 
          Hãy chọn loại mà bạn cảm thấy thu hút nhất! ✨
        </p>
      </div>
    </div>
  );
}