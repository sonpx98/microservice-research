'use client';

import { TarotCard } from "../types";
import { TarotCardBack } from "./TarotCardBack";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

interface FanSpreadProps {
  cards: TarotCard[];
  selectedIds: number[];
  onCardClick: (card: TarotCard) => void;
}

export function FanSpread({ cards, selectedIds, onCardClick }: FanSpreadProps) {
  // Configuration for the fan
  const radius = 800; // Condensed radius
  const totalAngle = 70; // Narrower spread
  const startAngle = -35; // Center at 0
  const peakHeight = 180; // Lower height
  
  const [isSpread, setIsSpread] = useState(false);
  const [isAnimComplete, setIsAnimComplete] = useState(false);

  useEffect(() => {
    // Trigger spread animation shortly after mount
    const spreadTimer = setTimeout(() => setIsSpread(true), 300);
    
    // Switch to fast transition for interaction after spread finishes
    // Max delay (approx 1.2s) + duration (0.8s) = ~2s
    const completeTimer = setTimeout(() => setIsAnimComplete(true), 2500);
    
    return () => {
      clearTimeout(spreadTimer);
      clearTimeout(completeTimer);
    };
  }, []);

  return (
    <div className="relative h-[380px] w-full max-w-5xl mx-auto flex items-end justify-center mt-6 mb-8">
      <div className="relative w-full h-full">
        {cards.map((card, index) => {
          const totalCards = cards.length;
          const step = totalAngle / (totalCards - 1);
          const angle = startAngle + index * step;
          const radian = (angle * Math.PI) / 180;
          
          const x = Math.sin(radian) * radius;
          const deltaY = radius * (1 - Math.cos(radian));
          const yFromBottom = peakHeight - deltaY;

          const isSelected = selectedIds.includes(card.id);
          
          // Animation delay based on index for "rushing" effect
          const transitionDelay = `${index * 15}ms`;

          return (
            <button
              key={card.id}
              onClick={() => onCardClick(card)}
              className={cn(
                "tarot-card-fan absolute left-1/2 bottom-0 shadow-md rounded-lg will-change-transform",
                isSelected ? "selected ring-2 ring-yellow-400 shadow-yellow-400/50" : ""
              )}
              style={{
                '--x': isSpread ? `${x}px` : '0px',
                '--y': isSpread ? `${-yFromBottom}px` : '100px',
                '--angle': isSpread ? `${angle}deg` : '0deg',
                '--delay': isAnimComplete ? '0s' : transitionDelay,
                '--duration': isAnimComplete ? '0.3s' : '0.8s',
                width: '70px',
                height: '120px',
                zIndex: isSelected ? 40 : index + 1
              } as React.CSSProperties}
              aria-label={`Select card ${index + 1}`}
            >
              <TarotCardBack size="sm" className="w-full h-full" />
            </button>
          );
        })}
      </div>
      
      <style jsx>{`
        .tarot-card-fan {
          transform-origin: center bottom;
          /* Transition duration dynamic based on animation state */
          transition: transform var(--duration) cubic-bezier(0.25, 0.8, 0.25, 1);
          transition-delay: var(--delay); 
          
          transform: translate(-50%, 0) translate(var(--x), var(--y)) rotate(var(--angle));
        }
        
        .tarot-card-fan:hover {
          z-index: 100 !important;
          transition-delay: 0s !important; /* Instant hover response */
          transition-duration: 0.2s;
          transform: translate(-50%, 0) translate(var(--x), calc(var(--y) - 40px)) rotate(var(--angle)) scale(1.2);
          box-shadow: 0 0 20px rgba(168, 85, 247, 0.6); /* Purple glow */
        }
        
        .tarot-card-fan.selected {
          z-index: 90 !important;
          transition-delay: 0s !important;
          transform: translate(-50%, 0) translate(var(--x), calc(var(--y) - 60px)) rotate(var(--angle)) scale(1.2);
        }
      `}</style>
    </div>
  );
}
