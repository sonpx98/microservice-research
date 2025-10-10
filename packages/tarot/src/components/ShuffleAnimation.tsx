import type { ReadingType } from '../data/readingTypes';

interface ShuffleAnimationProps {
  onShuffleComplete: () => void;
  isShuffling: boolean;
  readingType?: ReadingType;
  onBack?: () => void;
}

export function ShuffleAnimation({ onShuffleComplete, isShuffling, readingType, onBack }: ShuffleAnimationProps) {
  return (
    <div className="tw:flex tw:flex-col tw:items-center tw:space-y-8">
      <div className="tw:text-center">
        {readingType && (
          <div className="tw:mb-4">
            <div className="tw:text-4xl tw:mb-2">{readingType.icon}</div>
            <h3 className="tw:text-lg tw:font-semibold tw:text-purple-600 tw:mb-1">
              Chủ đề: {readingType.title}
            </h3>
            <p className="tw:text-sm tw:text-gray-600">
              {readingType.description}
            </p>
          </div>
        )}
        <h2 className="tw:text-2xl tw:font-bold tw:text-purple-800 tw:mb-2">
          Xào bài Tarot
        </h2>
        <p className="tw:text-gray-600">
          Tập trung vào câu hỏi của bạn và nhấn nút để xào bài
        </p>
      </div>
      
      {/* Deck of cards animation - với proper spacing */}
      <div className="tw:relative tw:w-32 tw:h-44 tw:flex tw:items-center tw:justify-center">
        {[...Array(5)].map((_, index) => (
          <div
            key={index}
            className={`
              tw:absolute tw:w-24 tw:h-36 tw:bg-gradient-to-b tw:from-indigo-800 tw:to-purple-900 
              tw:rounded-lg tw:border-2 tw:border-purple-300 tw:shadow-lg tw:transition-all tw:duration-500
              ${isShuffling ? 'tw:animate-pulse' : ''}
            `}
            style={{
              transform: `translate(${index * 2}px, ${index * -2}px) ${isShuffling ? `rotate(${Math.sin(Date.now() / 200 + index) * 10}deg)` : 'rotate(0deg)'}`,
              zIndex: 5 - index,
            }}
          >
            <div className="tw:absolute tw:inset-0 tw:flex tw:items-center tw:justify-center">
              <div className="tw:text-white tw:text-2xl">✨</div>
            </div>
            {/* Card back pattern */}
            <div className="tw:absolute tw:inset-2 tw:border tw:border-purple-400 tw:rounded-md tw:opacity-30"></div>
          </div>
        ))}
      </div>
      
      {/* Button với spacing tốt hơn */}
      <div className="tw:pt-4 tw:flex tw:flex-col tw:gap-3">
        {onBack && !isShuffling && (
          <button
            onClick={onBack}
            className="tw:px-6 tw:py-2 tw:rounded-lg tw:font-medium tw:text-purple-600 tw:border tw:border-purple-300 tw:bg-white tw:hover:bg-purple-50 tw:transition-all tw:duration-300"
          >
            ← Thay đổi chủ đề
          </button>
        )}
        
        <button
          onClick={onShuffleComplete}
          disabled={isShuffling}
          className={`
            tw:px-8 tw:py-4 tw:rounded-xl tw:font-semibold tw:text-white tw:transition-all tw:duration-300 tw:text-lg
            ${isShuffling 
              ? 'tw:bg-gray-400 tw:cursor-not-allowed tw:opacity-70' 
              : 'tw:bg-gradient-to-r tw:from-purple-600 tw:to-indigo-600 tw:hover:from-purple-700 tw:hover:to-indigo-700 tw:hover:scale-105 tw:shadow-lg tw:hover:shadow-xl tw:transform'
            }
          `}
        >
          {isShuffling ? (
            <span className="tw:flex tw:items-center tw:gap-2">
              <div className="tw:w-4 tw:h-4 tw:border-2 tw:border-white tw:border-t-transparent tw:rounded-full tw:animate-spin"></div>
              Đang xào bài...
            </span>
          ) : (
            'Xào bài'
          )}
        </button>
      </div>
      
      {isShuffling && (
        <div className="tw:text-center tw:text-purple-600 tw:animate-pulse tw:pt-2">
          <p className="tw:font-medium">Các lá bài đang được xào trộn...</p>
          <p className="tw:text-sm tw:opacity-80">Hãy tập trung vào câu hỏi của bạn</p>
        </div>
      )}
    </div>
  );
}