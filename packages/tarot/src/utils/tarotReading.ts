import type { TarotCard } from '../data/tarotCards';

interface ReadingInsight {
  theme: string;
  journey: string;
  advice: string;
  energy: string;
}

export function generateTarotReading(cards: [TarotCard, TarotCard, TarotCard]): ReadingInsight {
  const [past, present, future] = cards;
  
  // Phân tích theme chung dựa trên suits
  const suits = cards.map(card => card.suit);
  const majorArcanaCount = suits.filter(suit => suit === 'Major Arcana').length;
  
  let theme = '';
  if (majorArcanaCount >= 2) {
    theme = 'Đây là một giai đoạn có nhiều biến đổi lớn và ý nghĩa tâm linh sâu sắc trong cuộc đời bạn.';
  } else if (suits.includes('Cups')) {
    theme = 'Cảm xúc và tình yêu đang đóng vai trò quan trọng trong hành trình của bạn.';
  } else if (suits.includes('Wands')) {
    theme = 'Năng lượng sáng tạo và hành động đang dẫn dắt con đường của bạn.';
  } else if (suits.includes('Swords')) {
    theme = 'Trí tuệ và quyết định đang là trọng tâm của giai đoạn này.';
  } else if (suits.includes('Pentacles')) {
    theme = 'Vật chất và sự ổn định đang là ưu tiên hàng đầu.';
  } else {
    theme = 'Đây là thời điểm quan trọng để bạn suy ngẫm và tìm kiếm sự cân bằng.';
  }

  // Phân tích journey (hành trình)
  const pastKeyword = past.keywords[0];
  const presentKeyword = present.keywords[0];
  const futureKeyword = future.keywords[0];
  
  const journeyTemplates = [
    `Hành trình của bạn bắt đầu từ "${pastKeyword}" - một giai đoạn đã định hình nền tảng cho hiện tại. Giờ đây, "${presentKeyword}" đang là trung tâm của cuộc sống bạn, mang đến những cơ hội để học hỏi và phát triển. Tương lai hứa hẹn "${futureKeyword}" - một chương mới đầy tiềm năng.`,
    
    `Từ nền tảng "${pastKeyword}" trong quá khứ, bạn đã học được những bài học quý giá. Hiện tại, "${presentKeyword}" đang thử thách và nuôi dưỡng bạn. Con đường phía trước dẫn đến "${futureKeyword}" - nơi những nỗ lực của bạn sẽ được đền đáp.`,
    
    `Quá khứ với "${pastKeyword}" đã tạo nên con người bạn ngày hôm nay. "${presentKeyword}" là cầu nối quan trọng, và "${futureKeyword}" đang chờ đợi bạn khám phá những khả năng mới.`
  ];
  
  const journey = journeyTemplates[Math.floor(Math.random() * journeyTemplates.length)];

  // Tạo lời khuyên dựa trên combination
  let advice = '';
  if (past.suit === 'Major Arcana' && present.suit === 'Major Arcana') {
    advice = 'Đây là thời điểm tâm linh quan trọng. Hãy tin vào trực giác và lắng nghe tiếng nói nội tâm để đưa ra quyết định đúng đắn.';
  } else if (future.suit === 'Major Arcana') {
    advice = 'Một chương mới đầy ý nghĩa đang chờ đợi. Hãy chuẩn bị tinh thần cho những thay đổi tích cực sắp tới.';
  } else if (suits.includes('Cups') && suits.includes('Wands')) {
    advice = 'Sự kết hợp giữa cảm xúc và hành động sẽ mang lại kết quả tốt đẹp. Hãy theo đuổi đam mê một cách chân thành.';
  } else if (suits.includes('Swords') && suits.includes('Pentacles')) {
    advice = 'Sự cân bằng giữa suy nghĩ và hành động thực tế sẽ giúp bạn đạt được mục tiêu. Hãy lập kế hoạch cụ thể và kiên trì thực hiện.';
  } else {
    advice = 'Hãy tin tưởng vào khả năng của bản thân và giữ vững niềm tin. Mọi thử thách đều là cơ hội để bạn trưởng thành.';
  }

  // Phân tích năng lượng tổng thể
  const energyMap: Record<string, string> = {
    'Major Arcana': 'mạnh mẽ và tâm linh',
    'Cups': 'ấm áp và cảm xúc',
    'Wands': 'năng động và sáng tạo',
    'Swords': 'sắc bén và trí tuệ',
    'Pentacles': 'ổn định và thực tế'
  };

  const dominantSuit = suits.find(suit => 
    suits.filter(s => s === suit).length >= 2
  ) || suits[1]; // Lấy suit của lá hiện tại nếu không có suit nào chiếm ưu thế

  const energy = `Năng lượng chung của trải bài mang tính chất ${energyMap[dominantSuit] || 'cân bằng và hài hòa'}, giúp bạn ${
    dominantSuit === 'Major Arcana' ? 'kết nối với mục đích sống cao cả' :
    dominantSuit === 'Cups' ? 'hiểu rõ hơn về cảm xúc và mối quan hệ' :
    dominantSuit === 'Wands' ? 'khơi dậy nhiệt huyết và sáng tạo' :
    dominantSuit === 'Swords' ? 'tư duy sáng suốt và quyết đoán' :
    dominantSuit === 'Pentacles' ? 'xây dựng nền tảng vững chắc cho tương lai' :
    'tìm kiếm sự cân bằng trong cuộc sống'
  }.`;

  return {
    theme,
    journey,
    advice,
    energy
  };
}

// Thêm function để tạo cảm xúc phong phú
export function getEmotionalTone(cards: [TarotCard, TarotCard, TarotCard]): string {
  const positiveCards = ['The Sun', 'The Star', 'The World', 'Ace of Cups', 'Two of Cups'];
  const challengingCards = ['The Tower', 'Death', 'The Devil', 'Two of Swords'];
  
  const hasPositive = cards.some(card => positiveCards.includes(card.name));
  const hasChallenging = cards.some(card => challengingCards.includes(card.name));
  
  if (hasPositive && !hasChallenging) {
    return '✨ Trải bài mang đến những thông điệp tích cực và đầy hy vọng.';
  } else if (hasChallenging && !hasPositive) {
    return '⚡ Có những thử thách cần vượt qua, nhưng đây là cơ hội để bạn trưởng thành.';
  } else if (hasPositive && hasChallenging) {
    return '🌅 Cuộc sống có những thăng trầm, nhưng ánh sáng luôn xuất hiện sau bóng tối.';
  } else {
    return '🌸 Đây là thời điểm cân bằng, phù hợp để suy ngẫm và lên kế hoạch.';
  }
}