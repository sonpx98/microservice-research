import type { TarotCard } from '../data/tarotCards';
import { getSecureCardImage } from '../utils/secureCardImages';

interface TarotCardImageProps {
  card: TarotCard;
  className?: string;
}

export function TarotCardImage({ card, className = '' }: TarotCardImageProps) {
  // Use secure image function
  const getImageUrl = (card: TarotCard): string => {
    // First try to use provided imageUrl
    if (card.imageUrl) {
      return card.imageUrl;
    }
    
    // Use secure image loading
    console.log('🔒 Getting secure image for:', card.name);
    const localImage = getSecureCardImage(card.name);
    console.log('🔒 Secure image URL:', localImage);
    if (localImage) {
      return localImage;
    }
    
    // Finally fallback to placeholder
    return `https://via.placeholder.com/200x300/9333ea/ffffff?text=${encodeURIComponent(card.name)}`;
  };

  const imageUrl = getImageUrl(card);

  return (
    <div className={`tw:relative tw:overflow-hidden tw:rounded-lg ${className}`}>
      <img
        src={imageUrl}
        alt={card.name}
        className="tw:w-full tw:h-full tw:object-cover"
        onError={(e) => {
          // Fallback nếu image load fail
          const target = e.target as HTMLImageElement;
          target.src = `https://via.placeholder.com/200x300/9333ea/ffffff?text=${encodeURIComponent(card.name)}`;
        }}
      />
      
      {/* Overlay với tên card */}
      <div className="tw:absolute tw:bottom-0 tw:left-0 tw:right-0 tw:bg-gradient-to-t tw:from-black/70 tw:to-transparent tw:p-2">
        <div className="tw:text-white tw:text-sm tw:font-medium tw:text-center">
          {card.name}
        </div>
      </div>
    </div>
  );
}