import type { TarotCard } from '../data/tarotCards';

// Helper để tạo URL cho tarot card images
export const getTarotImageUrl = (cardName: string, suit: string): string => {
  // Normalize card name
  const normalizedName = cardName.toLowerCase()
    .replace(/^the\s+/, '') // Remove "The" prefix
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');

  // const normalizedSuit = suit.toLowerCase().replace(/\s+/g, '-');

  // Option 1: Sử dụng GitHub repository có tarot images
  // return `https://raw.githubusercontent.com/username/tarot-images/main/${normalizedSuit}/${normalizedName}.jpg`;

  // Option 2: Sử dụng free tarot API
  if (suit === 'Major Arcana') {
    const majorArcanaMap: Record<string, string> = {
      'fool': '0',
      'magician': '1',
      'high-priestess': '2',
      'empress': '3',
      'emperor': '4',
      'hierophant': '5',
      'lovers': '6',
      'chariot': '7',
      'strength': '8',
      'hermit': '9',
      'wheel-of-fortune': '10',
      'justice': '11',
      'hanged-man': '12',
      'death': '13',
      'temperance': '14',
      'devil': '15',
      'tower': '16',
      'star': '17',
      'moon': '18',
      'sun': '19',
      'judgement': '20',
      'world': '21'
    };
    
    const cardNumber = majorArcanaMap[normalizedName];
    if (cardNumber) {
      return `https://tarot-api-3hv5.onrender.com/api/v1/cards/m${cardNumber}`;
    }
  }

  // Option 3: Local fallback với custom design
  return `https://via.placeholder.com/200x300/9333ea/ffffff?text=${encodeURIComponent(cardName)}`;
};

// Danh sách URLs cho tất cả 78 lá bài (có thể update sau)
export const TAROT_IMAGE_URLS: Record<string, string> = {
  // Major Arcana
  'The Fool': 'https://via.placeholder.com/200x300/9333ea/ffffff?text=The+Fool',
  'The Magician': 'https://via.placeholder.com/200x300/9333ea/ffffff?text=The+Magician',
  'The High Priestess': 'https://via.placeholder.com/200x300/9333ea/ffffff?text=The+High+Priestess',
  // ... có thể thêm tất cả 78 lá
};

// Function để update image URLs cho existing cards
export const updateCardsWithImages = (cards: TarotCard[]) => {
  return cards.map(card => ({
    ...card,
    imageUrl: card.imageUrl || getTarotImageUrl(card.name, card.suit)
  }));
};