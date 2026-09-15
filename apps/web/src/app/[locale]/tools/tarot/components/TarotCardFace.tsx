'use client';

import Image from "next/image";
import { TarotCard } from "../types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface TarotCardFaceProps {
  card: TarotCard;
  size?: 'md' | 'lg';
  className?: string;
  showMeaning?: boolean;
}

export function TarotCardFace({ 
  card, 
  size = 'md', 
  className,
  showMeaning = false 
}: TarotCardFaceProps) {
  const sizeClasses = {
    md: 'w-24 h-40',
    lg: 'w-full aspect-[2/3] max-w-sm',
  };

  // Generate image filename from card name
  // e.g. "The Fool" -> "thefool.jpeg"
  // "Ace of Cups" -> "aceofcups.jpeg"
  const imageFilename = `${card.name.toLowerCase().replace(/\s+/g, '')}.jpeg`;
  const imagePath = `/tarot-cards/${imageFilename}`;

  return (
    <div 
      className={cn(
        "relative bg-white dark:bg-slate-900 border-4 border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-xl flex flex-col",
        sizeClasses[size],
        className
      )}
    >
      {/* Decorative Border */}
      <div className="absolute inset-1 border border-slate-300 dark:border-slate-600 rounded-lg pointer-events-none z-10"></div>
      
      {/* Card Content Container */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 text-center z-0 bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 h-full relative">
        
        {/* Full Card Image */}
        <Image
          src={imagePath}
          alt={card.name}
          fill
          className="object-cover"
          sizes={size === 'md' ? "96px" : "(max-width: 768px) 100vw, 384px"}
        />

        {/* Overlay content only if load fails or for specific design needs - currently hiding text behind image unless we want overlay */}
        {/* For now replacing the text-based design with the image entirely as requested */}
        
        {/* Keywords (only for lg size, overlayed at bottom) */}
        {size === 'lg' && (
          <div className="absolute bottom-4 left-0 right-0 z-20 flex flex-wrap justify-center gap-1 px-2">
             {card.keywords.slice(0, 3).map(k => (
               <Badge key={k} variant="secondary" className="text-xs bg-black/50 text-white hover:bg-black/70 backdrop-blur-sm border-none shadow-sm">{k}</Badge>
             ))}
          </div>
        )}
        
      </div>
      
      {/* Meaning Overlay (optional) */}
      
      {/* Meaning Overlay (optional) */}
      {showMeaning && (
         <div className="absolute inset-0 bg-black/80 flex items-center justify-center p-4 text-white text-center z-20 animate-in fade-in">
           <p className="text-sm">{card.meaning.upright}</p>
         </div>
      )}
    </div>
  );
}
