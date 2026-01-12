'use client';

import { useState, useEffect } from 'react';
import { TarotCard } from '../types';
import { FanSpread } from './FanSpread';
import { HorizontalScrollSpread } from './HorizontalScrollSpread';
import { SelectedCardsSlots } from './SelectedCardsSlots';
import { Button } from '@/components/ui/button';
import { useMediaQuery } from '@/hooks/use-media-query';

interface CardSpreadProps {
  cards: TarotCard[];
  requiredCards?: number;
  onComplete: (selectedCards: TarotCard[]) => void;
  labels?: string[];
}

export function CardSpread({ 
  cards, 
  requiredCards = 3, 
  onComplete,
  labels 
}: CardSpreadProps) {
  const [selectedCards, setSelectedCards] = useState<TarotCard[]>([]);
  const [shuffledCards, setShuffledCards] = useState<TarotCard[]>([]);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  // Shuffle cards on mount
  useEffect(() => {
    setShuffledCards([...cards].sort(() => Math.random() - 0.5));
  }, [cards]);

  const handleCardClick = (card: TarotCard) => {
    if (selectedCards.find(c => c.id === card.id)) {
      // Deselect if already selected
      handleRemoveCard(card);
    } else if (selectedCards.length < requiredCards) {
      // Select new card
      const newSelection = [...selectedCards, card];
      setSelectedCards(newSelection);
      
      // Auto-complete if full
      if (newSelection.length === requiredCards) {
        setTimeout(() => {
           onComplete(newSelection);
        }, 800);
      }
    }
  };

  const handleRemoveCard = (card: TarotCard) => {
    setSelectedCards(prev => prev.filter(c => c.id !== card.id));
  };

  const selectedIds = selectedCards.map(c => c.id);

  return (
    <div className="w-full flex flex-col items-center animate-in fade-in duration-500">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-amber-500 pb-2">
          Chọn {requiredCards} Lá Bài
        </h2>
        <p className="text-gray-500 dark:text-gray-400">
          Hãy tập trung vào câu hỏi của bạn và chọn những lá bài thu hút bạn nhất
        </p>
      </div>

      {/* Main Spread Area */}
      <div className="w-full mb-8 min-h-[300px] flex items-center justify-center">
        {isDesktop ? (
          <FanSpread 
            cards={shuffledCards} 
            selectedIds={selectedIds} 
            onCardClick={handleCardClick} 
          />
        ) : (
          <HorizontalScrollSpread 
            cards={shuffledCards} 
            selectedIds={selectedIds} 
            onCardClick={handleCardClick} 
          />
        )}
      </div>

      {/* Selected Slots */}
      <SelectedCardsSlots 
        slots={requiredCards} 
        selectedCards={selectedCards} 
        labels={labels}
        onRemove={handleRemoveCard}
      />
      
      <div className="mt-8 text-sm text-center text-slate-400">
        {selectedCards.length} / {requiredCards} đã chọn
      </div>
    </div>
  );
}
