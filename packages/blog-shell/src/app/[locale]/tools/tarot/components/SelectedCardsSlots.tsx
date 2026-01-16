'use client';

import { TarotCard } from "../types";
import { TarotCardFace } from "./TarotCardFace";
import { cn } from "@/lib/utils";
import { Sparkles } from 'lucide-react';

interface SelectedCardsSlotsProps {
  slots: number;
  selectedCards: TarotCard[];
  labels?: string[];
  onRemove?: (card: TarotCard) => void;
}

export function SelectedCardsSlots({ 
  slots, 
  selectedCards, 
  labels = ['Past', 'Present', 'Future'],
  onRemove
}: SelectedCardsSlotsProps) {
  return (
    <div className="flex justify-center gap-3 sm:gap-6 mt-4 sm:mt-8 px-2">
      {Array.from({ length: slots }).map((_, index) => {
        const card = selectedCards[index];
        const label = labels[index] || `Card ${index + 1}`;
        
        return (
          <div key={index} className="flex flex-col items-center gap-2 group">
            {/* Slot Container */}
            <div 
              className={cn(
                "relative w-24 h-40 sm:w-32 sm:h-52 rounded-xl transition-all duration-300",
                card 
                  ? "shadow-lg" 
                  : "border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-100/50 dark:bg-slate-800/50"
              )}
            >
              {card ? (
                <div className="relative w-full h-full animate-in zoom-in-50 duration-300">
                  <div className="w-full h-full rounded-xl overflow-hidden border-2 border-amber-400">
                     {/* Show back of card initially, we can flip later. For selection view, maybe just show back? 
                         Or show Mini Face? Let's show back to keep mystery until Reveal phase.
                         Actually, usually we see back until revealed.
                     */}
                     <div className="w-full h-full bg-indigo-950 flex items-center justify-center">
                        <Sparkles className="w-6 h-6 text-amber-400 opacity-50" />
                     </div>
                  </div>
                  
                  {/* Remove Button */}
                  {onRemove && (
                    <button 
                      onClick={() => onRemove(card)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                      title="Remove card"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <span className="text-slate-400 text-2xl font-bold opacity-30">{index + 1}</span>
                </div>
              )}
            </div>
            
            {/* Label */}
            <span className={cn(
              "text-xs sm:text-sm font-medium uppercase tracking-wider",
              card ? "text-purple-600 dark:text-purple-400" : "text-slate-400"
            )}>
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
