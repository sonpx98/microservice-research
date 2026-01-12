'use client';

import { useState } from 'react';
import { TarotCard, ReadingType } from '../types';
import { TarotCardFace } from './TarotCardFace';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ReadingInterpretation } from './ReadingInterpretation';
import { cn } from '@/lib/utils';

interface ReadingResultsProps {
  cards: TarotCard[];
  readingType: ReadingType;
  onReset: () => void;
  onNewReading: () => void;
}

export function ReadingResults({ cards, readingType, onReset, onNewReading }: ReadingResultsProps) {
  const [revealedCards, setRevealedCards] = useState<boolean[]>([false, false, false]);
  
  const handleReveal = (index: number) => {
    if (!revealedCards[index]) {
      const newRevealed = [...revealedCards];
      newRevealed[index] = true;
      setRevealedCards(newRevealed);
    }
  };

  const allRevealed = revealedCards.every(Boolean);

  // Labels mapping
  const labels = [
    readingType.interpretation.past,
    readingType.interpretation.present,
    readingType.interpretation.future
  ];

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col items-center animate-in fade-in duration-700">
      
      {/* Header */}
      <div className="text-center mb-8">
        <div className="text-4xl mb-2">{readingType.icon}</div>
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-500">
          {readingType.title}
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mt-2">
          {readingType.description}
        </p>
      </div>

      {/* Cards Display */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full px-4 mb-12">
        {cards.map((card, index) => (
          <div key={card.id} className="flex flex-col items-center gap-4 perspective-1000">
             <div 
               className={cn(
                 "relative w-48 h-80 transition-all duration-700 transform-style-3d cursor-pointer group",
                 revealedCards[index] ? "rotate-y-180" : ""
               )}
               onClick={() => handleReveal(index)}
             >
                {/* Back of Card (Front face in CSS terms currently, until rotated) */}
                <div className="absolute inset-0 backface-hidden">
                    <div className="w-full h-full rounded-xl bg-indigo-950 border-2 border-amber-400 shadow-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                       <span className="text-4xl animate-pulse">✨</span>
                       <div className="absolute bottom-4 text-amber-400 text-sm font-bold">Tap to Reveal</div>
                    </div>
                </div>

                {/* Front of Card (Back face in CSS terms, visible when rotated) */}
                <div className="absolute inset-0 backface-hidden rotate-y-180">
                   <TarotCardFace card={card} size="lg" className="w-full h-full shadow-2xl skew-y-0" />
                </div>
             </div>
             
             {/* Label & Meaning Preview */}
             <div className={cn(
               "text-center transition-opacity duration-500",
               revealedCards[index] ? "opacity-100" : "opacity-0"
             )}>
                <div className="text-amber-500 font-bold uppercase tracking-widest text-sm mb-1">
                   {labels[index]}
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                  {card.name}
                </h3>
             </div>
          </div>
        ))}
      </div>

      {/* Detailed Interpretation */}
      {allRevealed && (
         <div className="w-full animate-in slide-in-from-bottom-10 fade-in duration-700">
            <ReadingInterpretation 
              cards={cards} 
              readingType={readingType} 
              onReset={onReset}
              onNewReading={onNewReading}
            />
         </div>
      )}

      {/* Global Styles for Flip Effect */}
      <style jsx global>{`
        .perspective-1000 { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
    </div>
  );
}
