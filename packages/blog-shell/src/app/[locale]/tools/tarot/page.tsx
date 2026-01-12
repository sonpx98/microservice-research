'use client';

import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { AppState, ReadingType, TarotCard } from './types';
import { ReadingTypeSelector } from './components/ReadingTypeSelector';
import { CardSpread } from './components/CardSpread';
import { ReadingResults } from './components/ReadingResults';
import { tarotCards } from './data/tarot-cards';
import { readingTypes } from './data/reading-types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function TarotPage() {
  const [appState, setAppState] = useState<AppState>('select-type');
  const [selectedType, setSelectedType] = useState<ReadingType | null>(null);
  const [selectedCards, setSelectedCards] = useState<TarotCard[]>([]);

  const handleSelectType = (type: ReadingType) => {
    setSelectedType(type);
    setAppState('select-cards');
  };

  const handleTypeChange = (typeId: string) => {
    const newType = readingTypes.find(t => t.id === typeId);
    if (newType) {
      setSelectedType(newType);
      setSelectedCards([]); // Reset selection
      setAppState('select-cards');
    }
  };

  const handleCardsSelected = (cards: TarotCard[]) => {
    setSelectedCards(cards);
    setAppState('reveal');
  };
  
  const handleReset = () => {
    setAppState('select-type');
    setSelectedType(null);
    setSelectedCards([]);
  };

  const handleNewReading = () => {
    setAppState('select-type');
    setSelectedType(null);
    setSelectedCards([]);
  };

  return (
    <div className="w-full h-full py-8 px-4 transition-colors duration-500">
      
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
         <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-purple-500/10 blur-[100px] rounded-full mix-blend-multiply dark:mix-blend-screen animate-pulse"></div>
         <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] bg-blue-500/10 blur-[100px] rounded-full mix-blend-multiply dark:mix-blend-screen animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        
        {/* Header */}
        {appState === 'select-type' && (
           <div className="text-center mb-12 animate-in slide-in-from-top-10 fade-in duration-700">
             <h1 className="text-4xl md:text-6xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-500 to-amber-500">
               Tarot Reader
             </h1>
             <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
               Khám phá thông điệp từ vũ trụ qua những lá bài Tarot huyền bí. 
               Chọn chủ đề bên dưới để bắt đầu hành trình.
             </p>
           </div>
        )}

        {/* Dynamic Content */}
        <div className="min-h-[60vh] flex flex-col items-center justify-center">
          
          {appState === 'select-type' && (
            <div className="w-full animate-in zoom-in-95 duration-500">
               <ReadingTypeSelector onSelect={handleSelectType} />
            </div>
          )}

          {appState === 'select-cards' && selectedType && (
            <div className="w-full">
               <div className="mb-8 flex flex-col sm:flex-row items-center justify-between gap-6 bg-white/80 dark:bg-slate-900/80 p-6 rounded-2xl backdrop-blur-md border border-slate-200 dark:border-slate-700 shadow-lg animate-in slide-in-from-top-5">
                 <button 
                   onClick={() => setAppState('select-type')}
                   className="flex items-center gap-3 text-base font-medium text-slate-700 dark:text-slate-200 hover:text-purple-600 dark:hover:text-purple-400 transition-colors px-4 py-2 rounded-xl hover:bg-white/50 dark:hover:bg-slate-800/50"
                 >
                   <ArrowLeft className="w-5 h-5" />
                   <span>Chọn lại chủ đề</span>
                 </button>

                 <div className="flex items-center gap-4">
                   <span className="text-base text-slate-600 dark:text-slate-300 font-medium hidden sm:inline">Chủ đề hiện tại:</span>
                   <Select value={selectedType.id} onValueChange={handleTypeChange}>
                     <SelectTrigger className="w-[240px] h-12 text-base bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 px-4">
                       <SelectValue placeholder="Chọn chủ đề" />
                     </SelectTrigger>
                     <SelectContent>
                       {readingTypes.map((type) => (
                         <SelectItem key={type.id} value={type.id} className="text-base py-3">
                            <span className="flex items-center gap-3">
                              <span className="text-xl">{type.icon}</span>
                              <span>{type.title}</span>
                            </span>
                         </SelectItem>
                       ))}
                     </SelectContent>
                   </Select>
                 </div>
               </div>
               <CardSpread 
                 cards={tarotCards} 
                 onComplete={handleCardsSelected}
                 labels={[
                    selectedType.interpretation.past,
                    selectedType.interpretation.present,
                    selectedType.interpretation.future
                 ]} 
               />
            </div>
          )}

          {appState === 'reveal' && selectedType && (
            <ReadingResults 
              cards={selectedCards} 
              readingType={selectedType}
              onReset={handleReset}
              onNewReading={handleNewReading}
            />
          )}

        </div>
      </div>
    </div>
  );
}
