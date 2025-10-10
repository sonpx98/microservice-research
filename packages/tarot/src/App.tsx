import { useState } from 'react';
import { tarotCards } from './data/tarotCards';
import type { TarotCard } from './data/tarotCards';
import type { ReadingType } from './data/readingTypes';
import { ShuffleAnimation } from './components/ShuffleAnimation';
import { ThreeCardSpread } from './components/ThreeCardSpread';
import { ReadingTypeSelector } from './components/ReadingTypeSelector';
import { Breadcrumb } from './components/Breadcrumb';
import './App.css';

type AppState = 'select-type' | 'shuffle' | 'shuffling' | 'spread';

function App() {
  const [appState, setAppState] = useState<AppState>('select-type');
  const [selectedCards, setSelectedCards] = useState<[TarotCard, TarotCard, TarotCard] | null>(null);
  const [selectedReadingType, setSelectedReadingType] = useState<ReadingType | null>(null);

  const handleReadingTypeSelect = (readingType: ReadingType) => {
    setSelectedReadingType(readingType);
    setAppState('shuffle');
  };

  const shuffleCards = () => {
    setAppState('shuffling');
    
    // Simulate shuffling delay
    setTimeout(() => {
      const shuffled = [...tarotCards].sort(() => Math.random() - 0.5);
      const threeCards: [TarotCard, TarotCard, TarotCard] = [
        shuffled[0],
        shuffled[1],
        shuffled[2]
      ];
      setSelectedCards(threeCards);
      setAppState('spread');
    }, 2000);
  };

  const goBackToTypeSelection = () => {
    setAppState('select-type');
    setSelectedReadingType(null);
  };

  const resetReading = () => {
    setAppState('select-type');
    setSelectedCards(null);
    setSelectedReadingType(null);
  };

  const newReadingSameType = () => {
    setAppState('shuffle');
    setSelectedCards(null);
  };

  return (
    <div className="tw:min-h-screen tw:bg-gradient-to-br tw:from-purple-100 tw:via-blue-50 tw:to-indigo-100">
      <div className="tw:container tw:mx-auto tw:px-4 tw:py-8">
        {/* Header với breadcrumb */}
        <div className="tw:text-center tw:mb-8">
          <h1 className="tw:text-4xl tw:font-bold tw:text-purple-800 tw:mb-2">
            🔮 Tarot Reader
          </h1>
          <p className="tw:text-gray-600 tw:mb-6">
            Khám phá quá khứ, hiện tại và tương lai qua những lá bài tarot huyền bí
          </p>
          
          {/* Breadcrumb - chỉ hiển thị khi không phải ở trang chọn chủ đề */}
          {appState !== 'select-type' && (
            <Breadcrumb 
              currentStep={appState} 
              readingType={selectedReadingType || undefined}
            />
          )}
        </div>

        {/* Main content với proper spacing và min-height */}
        <div className="tw:flex tw:justify-center tw:items-start tw:min-h-[600px]">
          {appState === 'select-type' && (
            <div className="tw:w-full">
              <ReadingTypeSelector onSelect={handleReadingTypeSelect} />
            </div>
          )}

          {appState === 'shuffle' && selectedReadingType && (
            <div className="tw:w-full tw:max-w-md">
              <ShuffleAnimation 
                onShuffleComplete={shuffleCards}
                isShuffling={false}
                readingType={selectedReadingType}
                onBack={goBackToTypeSelection}
              />
            </div>
          )}
          
          {appState === 'shuffling' && selectedReadingType && (
            <div className="tw:w-full tw:max-w-md">
              <ShuffleAnimation 
                onShuffleComplete={() => {}}
                isShuffling={true}
                readingType={selectedReadingType}
                onBack={goBackToTypeSelection}
              />
            </div>
          )}
          
          {appState === 'spread' && selectedCards && selectedReadingType && (
            <div className="tw:w-full">
              <ThreeCardSpread 
                cards={selectedCards}
                readingType={selectedReadingType}
                onReset={resetReading}
                onNewReading={newReadingSameType}
                onChangeType={goBackToTypeSelection}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="tw:text-center tw:mt-8 tw:px-4">
          <p className="tw:text-sm tw:text-gray-500 tw:max-w-xl tw:mx-auto">
            ✨ Lưu ý: Tarot chỉ mang tính chất giải trí và suy ngẫm. 
            Hãy tin vào trực giác và quyết định của chính bạn. ✨
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
