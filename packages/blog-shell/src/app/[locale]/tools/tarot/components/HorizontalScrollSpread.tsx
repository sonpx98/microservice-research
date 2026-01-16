'use client';

import { TarotCard } from "../types";
import { TarotCardBack } from "./TarotCardBack";
import { cn } from "@/lib/utils";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface HorizontalScrollSpreadProps {
  cards: TarotCard[];
  selectedIds: number[];
  onCardClick: (card: TarotCard) => void;
}

export function HorizontalScrollSpread({ cards, selectedIds, onCardClick }: HorizontalScrollSpreadProps) {
  return (
    <div className="w-full max-w-[calc(100vw-2rem)] min-w-0 mx-auto py-8">
      <ScrollArea className="w-full whitespace-nowrap rounded-md border-none">
        <div className="flex w-max space-x-4 px-4 pb-4 pt-12">
          {cards.map((card) => {
            const isSelected = selectedIds.includes(card.id);
            return (
              <button
                key={card.id}
                onClick={() => onCardClick(card)}
                className={cn(
                  "relative transition-all duration-300 transform",
                  "hover:scale-105 active:scale-95",
                  isSelected ? "ring-2 ring-yellow-400 -translate-y-4 shadow-lg shadow-yellow-500/20" : "hover:-translate-y-2"
                )}
              >
                <div className={cn(
                    "transition-opacity duration-300",
                    isSelected ? "opacity-100" : "opacity-90"
                )}>
                   <TarotCardBack size="lg" className="w-[120px] h-[200px]" />
                </div>
                
                {/* Selected Indicator */}
                {isSelected && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-black text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">
                    Selected
                  </div>
                )}
              </button>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      
      <div className="text-center text-sm text-muted-foreground mt-2 animate-pulse">
        ← Vuốt để xem thêm →
      </div>
    </div>
  );
}
