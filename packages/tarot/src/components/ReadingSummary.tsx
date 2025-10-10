import type { TarotCard } from '../data/tarotCards';
import type { ReadingType } from '../data/readingTypes';

interface ReadingSummaryProps {
  cards: [TarotCard, TarotCard, TarotCard];
  readingType: ReadingType;
  onNewReading: () => void;
  onChangeType: () => void;
}

export function ReadingSummary({ cards, readingType, onNewReading, onChangeType }: ReadingSummaryProps) {
  // Tính toán một số thống kê thú vị
  const majorArcana = cards.filter(card => card.suit === 'Major Arcana').length;
  const suits = cards.map(card => card.suit).filter(suit => suit !== 'Major Arcana');
  const uniqueSuits = [...new Set(suits)].length;
  
  const getElementalEnergy = () => {
    const suitElements = {
      'Cups': 'Nước (Cảm xúc)',
      'Wands': 'Lửa (Hành động)',
      'Swords': 'Không khí (Tư duy)',
      'Pentacles': 'Đất (Vật chất)'
    };
    
    const elements = suits.map(suit => suitElements[suit as keyof typeof suitElements]).filter(Boolean);
    return [...new Set(elements)];
  };

  const elements = getElementalEnergy();

  return (
    <div className="tw:bg-gradient-to-br tw:from-purple-50 tw:to-indigo-50 tw:p-6 tw:rounded-2xl tw:border tw:border-purple-200 tw:mt-8">
      <div className="tw:text-center tw:mb-6">
        <h3 className="tw:text-2xl tw:font-bold tw:text-purple-800 tw:mb-2">
          ✨ Tóm tắt Reading ✨
        </h3>
        <p className="tw:text-gray-600">
          Nhìn lại hành trình của bạn qua {readingType.title.toLowerCase()}
        </p>
      </div>

      <div className="tw:grid tw:grid-cols-1 md:tw:grid-cols-3 tw:gap-4 tw:mb-6">
        {/* Thống kê Major Arcana */}
        <div className="tw:bg-white tw:p-4 tw:rounded-xl tw:text-center tw:shadow-sm">
          <div className="tw:text-2xl tw:mb-2">🎭</div>
          <div className="tw:font-semibold tw:text-purple-700">Major Arcana</div>
          <div className="tw:text-lg tw:font-bold tw:text-purple-600">{majorArcana}/3</div>
          <div className="tw:text-xs tw:text-gray-600 tw:mt-1">
            {majorArcana === 3 ? 'Hành trình tâm linh mạnh mẽ' :
             majorArcana === 2 ? 'Năng lượng biến đổi lớn' :
             majorArcana === 1 ? 'Ảnh hưởng tâm linh nhẹ' :
             'Tập trung vào đời thường'}
          </div>
        </div>

        {/* Thống kê nguyên tố */}
        <div className="tw:bg-white tw:p-4 tw:rounded-xl tw:text-center tw:shadow-sm">
          <div className="tw:text-2xl tw:mb-2">🌟</div>
          <div className="tw:font-semibold tw:text-purple-700">Nguyên tố</div>
          <div className="tw:text-lg tw:font-bold tw:text-purple-600">{elements.length}</div>
          <div className="tw:text-xs tw:text-gray-600 tw:mt-1">
            {elements.length === 1 ? 'Năng lượng tập trung' :
             elements.length === 2 ? 'Cân bằng năng lượng' :
             elements.length >= 3 ? 'Đa dạng năng lượng' :
             'Không có dữ liệu'}
          </div>
        </div>

        {/* Thống kê bộ bài */}
        <div className="tw:bg-white tw:p-4 tw:rounded-xl tw:text-center tw:shadow-sm">
          <div className="tw:text-2xl tw:mb-2">🃏</div>
          <div className="tw:font-semibold tw:text-purple-700">Bộ bài khác nhau</div>
          <div className="tw:text-lg tw:font-bold tw:text-purple-600">{uniqueSuits}</div>
          <div className="tw:text-xs tw:text-gray-600 tw:mt-1">
            {uniqueSuits === 1 ? 'Chủ đề tập trung' :
             uniqueSuits === 2 ? 'Hai khía cạnh chính' :
             uniqueSuits >= 3 ? 'Đa chiều phức tạp' :
             'Tập trung Major Arcana'}
          </div>
        </div>
      </div>

      {/* Danh sách nguyên tố hiện diện */}
      {elements.length > 0 && (
        <div className="tw:bg-white tw:p-4 tw:rounded-xl tw:mb-4">
          <h4 className="tw:font-semibold tw:text-purple-700 tw:mb-2">🔥 Năng lượng nguyên tố:</h4>
          <div className="tw:flex tw:flex-wrap tw:gap-2">
            {elements.map((element, index) => (
              <span 
                key={index}
                className="tw:px-3 tw:py-1 tw:bg-purple-100 tw:text-purple-700 tw:rounded-full tw:text-sm tw:font-medium"
              >
                {element}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Các lá bài trong reading */}
      <div className="tw:bg-white tw:p-4 tw:rounded-xl tw:mb-6">
        <h4 className="tw:font-semibold tw:text-purple-700 tw:mb-3">🎴 Các lá bài trong reading:</h4>
        <div className="tw:space-y-2">
          {cards.map((card, index) => {
            const positions = ['Quá khứ', 'Hiện tại', 'Tương lai'];
            return (
              <div key={index} className="tw:flex tw:items-center tw:justify-between tw:py-2 tw:border-b tw:border-gray-100 last:tw:border-b-0">
                <div className="tw:flex tw:items-center tw:gap-3">
                  <span className="tw:w-16 tw:text-sm tw:font-medium tw:text-gray-600">
                    {positions[index]}:
                  </span>
                  <span className="tw:font-medium tw:text-purple-800">
                    {card.name}
                  </span>
                </div>
                <span className="tw:text-xs tw:px-2 tw:py-1 tw:bg-gray-100 tw:rounded tw:text-gray-600">
                  {card.suit}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action buttons */}
      <div className="tw:flex tw:gap-3 tw:justify-center">
        <button
          onClick={onNewReading}
          className="tw:px-6 tw:py-3 tw:bg-gradient-to-r tw:from-purple-600 tw:to-indigo-600 tw:text-white tw:font-semibold tw:rounded-xl tw:hover:from-purple-700 tw:hover:to-indigo-700 tw:transition-all tw:duration-300 tw:transform tw:hover:scale-105 tw:shadow-lg"
        >
          🔄 Reading mới cùng chủ đề
        </button>
        <button
          onClick={onChangeType}
          className="tw:px-6 tw:py-3 tw:bg-white tw:text-purple-600 tw:font-semibold tw:rounded-xl tw:border tw:border-purple-300 tw:hover:bg-purple-50 tw:transition-all tw:duration-300"
        >
          🎯 Thay đổi chủ đề
        </button>
      </div>
    </div>
  );
}