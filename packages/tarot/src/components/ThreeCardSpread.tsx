import { useState } from 'react';
import type { TarotCard } from '../data/tarotCards';
import type { ReadingType } from '../data/readingTypes';
import { TarotCardComponent } from './TarotCard';
import { ReadingSummary } from './ReadingSummary';
import { generateTarotReading, getEmotionalTone } from '../utils/tarotReading';
import { generateAIReading, type AIReadingResponse } from '../utils/aiReading';

interface ThreeCardSpreadProps {
  cards: [TarotCard, TarotCard, TarotCard];
  readingType: ReadingType;
  onReset: () => void;
  onNewReading?: () => void;
  onChangeType?: () => void;
}

export function ThreeCardSpread({ cards, readingType, onReset, onNewReading, onChangeType }: ThreeCardSpreadProps) {
  const [revealedCards, setRevealedCards] = useState<boolean[]>([false, false, false]);
  const [currentReveal, setCurrentReveal] = useState(0);
  const [aiReading, setAiReading] = useState<AIReadingResponse | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [showAISection, setShowAISection] = useState(false);
  
  // Safety check
  if (!cards || !readingType || cards.length !== 3) {
    return (
      <div className="tw:text-center tw:text-red-600 tw:p-8">
        <p>Lỗi: Dữ liệu bài không hợp lệ</p>
      </div>
    );
  }
  
  // Generate rich reading insight
  const reading = generateTarotReading(cards);
  const emotionalTone = getEmotionalTone(cards);

  const handleAIReading = async () => {
    setIsLoadingAI(true);
    setShowAISection(true);
    
    // Try to get AI reading (you can add API key here)
    const apiKey = localStorage.getItem('groq_api_key') || process.env.REACT_APP_GROQ_API_KEY;
    const result = await generateAIReading(cards, apiKey, readingType);
    
    setAiReading(result);
    setIsLoadingAI(false);
  };

  const handleCardClick = (index: number) => {
    if (index === currentReveal && !revealedCards[index]) {
      const newRevealed = [...revealedCards];
      newRevealed[index] = true;
      setRevealedCards(newRevealed);
      
      if (currentReveal < 2) {
        setTimeout(() => {
          setCurrentReveal(currentReveal + 1);
        }, 1000);
      }
    }
  };

  const allRevealed = revealedCards.every(revealed => revealed);

  return (
    <div className="tw:flex tw:flex-col tw:items-center tw:space-y-6 tw:w-full tw:px-4 tw:max-w-7xl tw:mx-auto">
      <div className="tw:text-center tw:max-w-2xl tw:px-4">
        <div className="tw:mb-4">
          <div className="tw:text-4xl tw:mb-2">{readingType.icon}</div>
          <h2 className="tw:text-2xl sm:tw:text-3xl tw:font-bold tw:text-purple-800 tw:mb-2">
            Trải Bài Ba Thời Kỳ - {readingType.title}
          </h2>
          <p className="tw:text-sm sm:tw:text-base tw:text-gray-600 tw:mb-4">
            {readingType.description}
          </p>
        </div>
        
        {!allRevealed && (
          <div className="tw:bg-yellow-100 tw:border tw:border-yellow-300 tw:rounded-lg tw:p-3 tw:inline-block">
            <p className="tw:text-yellow-800 tw:text-xs tw:sm:text-sm">
              {currentReveal === 0 && `Nhấn vào lá bài đầu tiên để khám phá: ${readingType.interpretation.past.toLowerCase()}`}
              {currentReveal === 1 && `Nhấn vào lá bài thứ hai để khám phá: ${readingType.interpretation.present.toLowerCase()}`}
              {currentReveal === 2 && `Nhấn vào lá bài cuối cùng để khám phá: ${readingType.interpretation.future.toLowerCase()}`}
            </p>
          </div>
        )}
      </div>

      {/* Three cards layout - Responsive design */}
      <div className="tw:w-full tw:px-2 tw:sm:px-4">
        <div className="tw:flex tw:justify-center tw:items-start tw:gap-3 tw:sm:gap-4 tw:lg:gap-6 tw:w-full tw:max-w-4xl tw:mx-auto">
          <div className="tw:flex-1 tw:min-w-0 tw:max-w-[100px] tw:sm:max-w-[130px] tw:md:max-w-[150px] tw:lg:max-w-[170px]">
            <TarotCardComponent
              card={cards[0]}
              position="past"
              isRevealed={revealedCards[0]}
              onClick={() => handleCardClick(0)}
              customLabels={readingType.interpretation}
            />
          </div>
          <div className="tw:flex-1 tw:min-w-0 tw:max-w-[100px] tw:sm:max-w-[130px] tw:md:max-w-[150px] tw:lg:max-w-[170px]">
            <TarotCardComponent
              card={cards[1]}
              position="present"
              isRevealed={revealedCards[1]}
              onClick={() => handleCardClick(1)}
              customLabels={readingType.interpretation}
            />
          </div>
          <div className="tw:flex-1 tw:min-w-0 tw:max-w-[100px] tw:sm:max-w-[130px] tw:md:max-w-[150px] tw:lg:max-w-[170px]">
            <TarotCardComponent
              card={cards[2]}
              position="future"
              isRevealed={revealedCards[2]}
              onClick={() => handleCardClick(2)}
              customLabels={readingType.interpretation}
            />
          </div>
        </div>
      </div>

      {/* Reading interpretation với better spacing */}
      {allRevealed && (
        <div className="tw:w-full tw:max-w-5xl tw:mt-8">
          <div className="tw:bg-purple-50 tw:border tw:border-purple-200 tw:rounded-xl tw:p-4 sm:p-6 tw:shadow-lg">
            <h3 className="tw:text-lg tw:sm:text-xl tw:font-bold tw:text-purple-800 tw:mb-4 tw:sm:mb-6 tw:text-center">
              🔮 Giải Mã Trải Bài
            </h3>
            
            <div className="space-y-6">
              {/* Cards meanings với custom classes */}
              <div className="tw:grid tw:grid-cols-1 tw:md:grid-cols-3 tw:gap-4 tw:sm:gap-6">
                <div className="tw:text-center tw:p-4 tw:bg-white tw:rounded-lg tw:border tw:border-purple-100">
                  <h4 className="tw:font-semibold tw:text-purple-700 tw:mb-3 tw:text-sm tw:sm:text-base">📜 Quá Khứ</h4>
                  <p className="tw:text-xs tw:sm:text-sm tw:text-gray-700 tw:leading-relaxed tw:mb-3">
                    {cards[0].meaning.upright}
                  </p>
                  <div className="tw:text-xs tw:text-purple-600 tw:bg-purple-50 tw:rounded-md tw:p-2">
                    <strong>Từ khóa:</strong> {cards[0].keywords.join(', ')}
                  </div>
                </div>
                
                <div className="tw:text-center tw:p-4 tw:bg-white tw:rounded-lg tw:border tw:border-purple-100">
                  <h4 className="tw:font-semibold tw:text-purple-700 tw:mb-3 tw:text-sm tw:sm:text-base">⭐ Hiện Tại</h4>
                  <p className="tw:text-xs tw:sm:text-sm tw:text-gray-700 tw:leading-relaxed tw:mb-3">
                    {cards[1].meaning.upright}
                  </p>
                  <div className="tw:text-xs tw:text-purple-600 tw:bg-purple-50 tw:rounded-md tw:p-2">
                    <strong>Từ khóa:</strong> {cards[1].keywords.join(', ')}
                  </div>
                </div>
                
                <div className="tw:text-center tw:p-4 tw:bg-white tw:rounded-lg tw:border tw:border-purple-100">
                  <h4 className="tw:font-semibold tw:text-purple-700 tw:mb-3 tw:text-sm tw:sm:text-base">🌟 Tương Lai</h4>
                  <p className="tw:text-xs tw:sm:text-sm tw:text-gray-700 tw:leading-relaxed tw:mb-3">
                    {cards[2].meaning.upright}
                  </p>
                  <div className="tw:text-xs tw:text-purple-600 tw:bg-purple-50 tw:rounded-md tw:p-2">
                    <strong>Từ khóa:</strong> {cards[2].keywords.join(', ')}
                  </div>
                </div>
              </div>
              
              {/* Separator line */}
              <div className="tw:border-t tw:border-purple-200 tw:pt-4 tw:sm:pt-6 tw:space-y-4 tw:sm:space-y-6">
                {/* Emotional tone */}
                <div className="tw:text-center tw:bg-gradient-to-r tw:from-purple-100 tw:to-blue-100 tw:rounded-lg tw:p-3 tw:sm:p-4">
                  <p className="tw:text-sm tw:sm:text-base tw:font-medium tw:text-purple-700 tw:mb-1">
                    💫 Tâm Trạng Tổng Thể
                  </p>
                  <p className="tw:text-xs tw:sm:text-sm tw:text-purple-600">
                    {emotionalTone}
                  </p>
                </div>
                
                {/* Theme */}
                <div className="tw:bg-white tw:rounded-lg tw:p-4 tw:sm:p-6 tw:border tw:border-purple-100">
                  <h4 className="tw:font-semibold tw:text-purple-700 tw:mb-3 tw:text-center tw:text-sm tw:sm:text-base">
                    🌟 Chủ Đề Chính
                  </h4>
                  <p className="tw:text-xs tw:sm:text-sm tw:text-gray-700 tw:text-center tw:leading-relaxed">
                    {reading.theme}
                  </p>
                </div>
                
                {/* Journey */}
                <div>
                  <h4 className="tw:font-semibold tw:text-purple-700 tw:mb-2 tw:text-center">🛤️ Hành Trình Của Bạn</h4>
                  <p className="tw:text-sm tw:text-gray-700 tw:text-center tw:leading-relaxed">
                    {reading.journey}
                  </p>
                </div>
                
                {/* Advice */}
                <div>
                  <h4 className="tw:font-semibold tw:text-purple-700 tw:mb-2 tw:text-center">💡 Lời Khuyên</h4>
                  <p className="tw:text-sm tw:text-gray-700 tw:text-center tw:leading-relaxed">
                    {reading.advice}
                  </p>
                </div>
                
                {/* Energy */}
                <div className="tw:bg-gradient-to-r tw:from-purple-50 tw:to-blue-50 tw:rounded-lg tw:p-3">
                  <h4 className="tw:font-semibold tw:text-purple-700 tw:mb-2 tw:text-center">⚡ Năng Lượng Tổng Thể</h4>
                  <p className="tw:text-sm tw:text-gray-700 tw:text-center tw:leading-relaxed">
                    {reading.energy}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reset button and AI Reading */}
      {allRevealed && (
        <div className="tw:flex tw:flex-col tw:items-center tw:space-y-4">
          <div className="tw:flex tw:gap-4">
            <button
              onClick={onReset}
              className="tw:px-6 tw:py-3 tw:bg-purple-600 tw:text-white tw:rounded-lg tw:font-semibold 
                       tw:hover:bg-purple-700 tw:transition-all tw:duration-300 tw:hover:scale-105 
                       tw:shadow-lg tw:hover:shadow-xl"
            >
              Xào Bài Lại
            </button>
            
            {!showAISection && (
              <button
                onClick={handleAIReading}
                className="tw:px-6 tw:py-3 tw:bg-gradient-to-r tw:from-pink-500 tw:to-purple-600 tw:text-white tw:rounded-lg tw:font-semibold 
                         tw:hover:from-pink-600 tw:hover:to-purple-700 tw:transition-all tw:duration-300 tw:hover:scale-105 
                         tw:shadow-lg tw:hover:shadow-xl"
              >
                🤖 Giải Thích Bằng AI
              </button>
            )}
          </div>
          
          {/* AI Reading Section */}
          {showAISection && (
            <div className="tw:max-w-4xl tw:w-full tw:mt-6">
              <div className="tw:bg-gradient-to-r tw:from-pink-50 tw:to-purple-50 tw:border tw:border-pink-200 tw:rounded-lg tw:p-6">
                <h3 className="tw:text-xl tw:font-bold tw:text-pink-800 tw:mb-4 tw:text-center tw:flex tw:items-center tw:justify-center tw:gap-2">
                  🤖 Giải Thích Bằng AI
                  {isLoadingAI && <span className="tw:animate-spin">⚡</span>}
                </h3>
                
                {isLoadingAI && (
                  <div className="tw:text-center tw:py-8">
                    <div className="tw:animate-pulse tw:space-y-3">
                      <div className="tw:h-4 tw:bg-pink-200 tw:rounded tw:w-3/4 tw:mx-auto"></div>
                      <div className="tw:h-4 tw:bg-pink-200 tw:rounded tw:w-1/2 tw:mx-auto"></div>
                      <div className="tw:h-4 tw:bg-pink-200 tw:rounded tw:w-2/3 tw:mx-auto"></div>
                    </div>
                    <p className="tw:text-pink-600 tw:mt-4">
                      AI đang phân tích trải bài của bạn một cách sâu sắc...
                    </p>
                  </div>
                )}
                
                {!isLoadingAI && !aiReading && (
                  <div className="tw:text-center tw:py-6">
                    <p className="tw:text-pink-700 tw:mb-4">
                      💡 Để sử dụng tính năng AI, bạn cần API key miễn phí từ:
                    </p>
                    <div className="tw:space-y-2 tw:text-sm">
                      <div className="tw:bg-white tw:rounded tw:p-3">
                        <strong>🚀 Groq (Khuyên dùng):</strong> 
                        <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer" 
                           className="tw:text-blue-600 tw:hover:underline tw:ml-2">
                          console.groq.com/keys
                        </a>
                        <div className="tw:text-gray-600 tw:text-xs tw:mt-1">Free tier: 6,000 token/phút</div>
                      </div>
                      <div className="tw:bg-white tw:rounded tw:p-3">
                        <strong>🧠 Google Gemini:</strong> 
                        <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer"
                           className="tw:text-blue-600 tw:hover:underline tw:ml-2">
                          aistudio.google.com/app/apikey
                        </a>
                        <div className="tw:text-gray-600 tw:text-xs tw:mt-1">Free tier: 15 requests/phút</div>
                      </div>
                    </div>
                    <p className="tw:text-xs tw:text-gray-500 tw:mt-3">
                      Lưu API key vào localStorage với tên 'groq_api_key'
                    </p>
                  </div>
                )}
                
                {aiReading && (
                  <div className="tw:space-y-6">
                    <div>
                      <h4 className="tw:font-semibold tw:text-pink-700 tw:mb-3 tw:flex tw:items-center tw:gap-2">
                        🔮 Giải Thích Sâu Sắc
                      </h4>
                      <p className="tw:text-gray-700 tw:leading-relaxed">
                        {aiReading.interpretation}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="tw:font-semibold tw:text-pink-700 tw:mb-3 tw:flex tw:items-center tw:gap-2">
                        💫 Lời Khuyên Từ AI
                      </h4>
                      <p className="tw:text-gray-700 tw:leading-relaxed">
                        {aiReading.advice}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="tw:font-semibold tw:text-pink-700 tw:mb-3 tw:flex tw:items-center tw:gap-2">
                        🧘‍♀️ Suy Ngẫm Sâu Sắc
                      </h4>
                      <p className="tw:text-gray-700 tw:leading-relaxed">
                        {aiReading.meditation}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Reading Summary - chỉ hiển thị khi tất cả cards đã được reveal */}
      {allRevealed && (onNewReading || onChangeType) && (
        <ReadingSummary
          cards={cards}
          readingType={readingType}
          onNewReading={onNewReading || onReset}
          onChangeType={onChangeType || onReset}
        />
      )}
    </div>
  );
}