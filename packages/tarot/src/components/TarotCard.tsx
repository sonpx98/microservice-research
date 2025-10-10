import type { TarotCard } from '../data/tarotCards';
import { TarotCardImage } from './TarotCardImage';

interface TarotCardComponentProps {
  card: TarotCard | null;
  position: 'past' | 'present' | 'future';
  isRevealed: boolean;
  onClick?: () => void;
  customLabels?: {
    past: string;
    present: string;
    future: string;
  };
}

export function TarotCardComponent({ card, position, isRevealed, onClick, customLabels }: TarotCardComponentProps) {
  const positionTitles = customLabels || {
    past: 'Quá khứ',
    present: 'Hiện tại',
    future: 'Tương lai'
  };

  return (
    <div className="tw:flex tw:flex-col tw:items-center tw:space-y-2 tw:sm:space-y-3 tw:w-full">
      <h3 className="tw:text-xs tw:sm:text-sm tw:lg:text-base tw:font-semibold tw:text-purple-800 tw:text-center tw:min-h-[2.5rem] tw:sm:min-h-[3rem] tw:flex tw:justify-center tw:leading-tight tw:px-1">
        {positionTitles[position]}
      </h3>
      
      <div 
        className={`
          tw:relative tw:w-full tw:aspect-[2/3] tw:max-w-full
          tw:rounded-lg tw:border-2 tw:border-purple-300
          tw:cursor-pointer tw:transition-all tw:duration-500 tw:transform-gpu
          ${isRevealed ? 'tw:bg-gradient-to-b tw:from-purple-100 tw:to-purple-200' : 'tw:bg-gradient-to-b tw:from-indigo-800 tw:to-purple-900'}
          ${!isRevealed ? 'tw:hover:scale-105' : ''}
          tw:shadow-lg tw:hover:shadow-xl
        `}
        onClick={onClick}
      >
        {/* Card back design */}
        {!isRevealed && (
          <div className="tw:absolute tw:inset-2 tw:flex tw:items-center tw:justify-center">
            <div className="tw:text-center tw:text-white">
              <div className="tw:text-base tw:sm:text-lg tw:lg:text-xl tw:mb-1">✨</div>
              <div className="tw:text-[10px] tw:sm:text-xs tw:font-bold">TAROT</div>
              <div className="tw:text-[10px] tw:sm:text-xs">CARD</div>
            </div>
          </div>
        )}
        
        {/* Card front with content */}
        {isRevealed && card && (
          <div className="tw:absolute tw:inset-0 tw:flex tw:flex-col">
            {/* Card image */}
            <div className="tw:flex-1 tw:w-full tw:h-full">
              <TarotCardImage
                card={card}
                className="tw:w-full tw:h-full tw:object-cover tw:rounded-md"
              />
            </div>
          </div>
        )}
      </div>
      
      {/* Card description - responsive display */}
      {isRevealed && card && (
        <div className="tw:text-center tw:max-w-full tw:mt-1 tw:sm:mt-2 tw:px-1">
          <div className="tw:text-[8px] tw:sm:text-[10px] tw:lg:text-xs tw:text-purple-700 tw:leading-tight tw:line-clamp-3">
            {card.description}
          </div>
        </div>
      )}
    </div>
  );
}