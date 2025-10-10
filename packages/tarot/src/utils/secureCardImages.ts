// Secure image serving with whitelist approach

// SECURITY: Whitelist exact filenames only
const ALLOWED_IMAGES = new Set([
  // Major Arcana
  'thefool.jpeg', 'themagician.jpeg', 'thehighpriestess.jpeg', 'theempress.jpeg',
  'theemperor.jpeg', 'thehierophant.jpeg', 'TheLovers.jpg', 'thechariot.jpeg',
  'thestrength.jpeg', 'thehermit.jpeg', 'wheeloffortune.jpeg', 'justice.jpeg',
  'thehangedman.jpeg', 'death.jpeg', 'temperance.jpeg', 'thedevil.jpeg',
  'thetower.jpeg', 'thestar.jpeg', 'themoon.jpeg', 'thesun.jpeg',
  'judgement.jpeg', 'theworld.jpeg',
  
  // Cups
  'aceofcups.jpeg', 'twoofcups.jpeg', 'threeofcups.jpeg', 'fourofcups.jpeg',
  'fiveofcups.jpeg', 'sixofcups.jpeg', 'sevenofcups.jpeg', 'eightofcups.jpeg',
  'nineofcups.jpeg', 'tenofcups.jpeg', 'pageofcups.jpeg', 'knightofcups.jpeg',
  'queenofcups.jpeg', 'kingofcups.jpeg',
  
  // Wands
  'aceofwands.jpeg', 'twoofwands.jpeg', 'threeofwands.jpeg', 'fourofwands.jpeg',
  'fiveofwands.jpeg', 'sixofwands.jpeg', 'sevenofwands.jpeg', 'eightofwands.jpeg',
  'nineofwands.jpeg', 'tenofwands.jpeg', 'pageofwands.jpeg', 'knightofwands.jpeg',
  'queenofwands.jpeg', 'kingofwands.jpeg',
  
  // Swords  
  'aceofswords.jpeg', 'twoofswords.jpeg', 'threeofswords.jpeg', 'fourofswords.jpeg',
  'fiveofswords.jpeg', 'sixofswords.jpeg', 'sevenofswords.jpeg', 'eightofswords.jpeg',
  'nineofswords.jpeg', 'tenofswords.jpeg', 'pageofswords.jpeg', 'knightofswords.jpeg',
  'queenofswords.jpeg', 'kingofswords.jpeg',
  
  // Pentacles
  'aceofpentacles.jpeg', 'twoofpentacles.jpeg', 'threeofpentacles.jpeg', 'fourofpentacles.jpeg',
  'fiveofpentacles.jpeg', 'sixofpentacles.jpeg', 'sevenofpentacles.jpeg', 'eightofpentacles.jpeg',
  'nineofpentacles.jpeg', 'tenofpentacles.jpeg', 'pageofpentacles.jpeg', 'knightofpentacles.jpeg',
  'queenofpentacles.jpeg', 'kingofpentacles.jpeg'
]);

// Secure filename validation
const isValidImageFile = (filename: string): boolean => {
  // SECURITY: Only allow whitelisted files
  if (!ALLOWED_IMAGES.has(filename)) {
    console.warn('🚨 Security: Blocked unauthorized image:', filename);
    return false;
  }
  
  // SECURITY: Prevent directory traversal
  if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    console.warn('🚨 Security: Blocked path traversal attempt:', filename);
    return false;
  }
  
  // SECURITY: Only allow image extensions
  const allowedExtensions = ['.jpeg', '.jpg', '.png', '.webp'];
  const hasValidExtension = allowedExtensions.some(ext => filename.toLowerCase().endsWith(ext));
  if (!hasValidExtension) {
    console.warn('🚨 Security: Blocked non-image file:', filename);
    return false;
  }
  
  return true;
};

// Secure image URL generation
export const getSecureCardImage = (cardName: string): string | undefined => {
  console.log('🔍 Looking for card:', cardName);
  
  // Get image filename
  const imageFileName = getImageFileName(cardName);
  if (!imageFileName) {
    console.log('❌ No filename found for:', cardName);
    return undefined;
  }

  // SECURITY: Validate filename
  if (!isValidImageFile(imageFileName)) {
    console.error('🚨 Security: Invalid image file rejected:', imageFileName);
    return undefined;
  }

  // Check if we're in Module Federation mode
  const isModuleFederation = window.location.port !== '5003' && window.location.port !== '5005';
  
  if (isModuleFederation) {
    // Use remote URL with validation
    const remoteImageUrl = `http://localhost:5003/images/${encodeURIComponent(imageFileName)}`;
    console.log('🌐 Using secure remote URL:', remoteImageUrl);
    return remoteImageUrl;
  } else {
    // Use public URL with validation
    const publicUrl = `/images/${encodeURIComponent(imageFileName)}`;
    console.log('📁 Using secure public URL:', publicUrl);
    return publicUrl;
  }
};

// Helper to map card names to file names (unchanged)
const getImageFileName = (cardName: string): string | undefined => {
  const fileMap: Record<string, string> = {
    // Major Arcana
    'The Fool': 'thefool.jpeg',
    'The Magician': 'themagician.jpeg',
    'The High Priestess': 'thehighpriestess.jpeg',
    'The Empress': 'theempress.jpeg',
    'The Emperor': 'theemperor.jpeg',
    'The Hierophant': 'thehierophant.jpeg',
    'The Lovers': 'TheLovers.jpg',
    'The Chariot': 'thechariot.jpeg',
    'Strength': 'thestrength.jpeg',
    'The Hermit': 'thehermit.jpeg',
    'Wheel of Fortune': 'wheeloffortune.jpeg',
    'Justice': 'justice.jpeg',
    'The Hanged Man': 'thehangedman.jpeg',
    'Death': 'death.jpeg',
    'Temperance': 'temperance.jpeg',
    'The Devil': 'thedevil.jpeg',
    'The Tower': 'thetower.jpeg',
    'The Star': 'thestar.jpeg',
    'The Moon': 'themoon.jpeg',
    'The Sun': 'thesun.jpeg',
    'Judgement': 'judgement.jpeg',
    'The World': 'theworld.jpeg',

    // Cups
    'Ace of Cups': 'aceofcups.jpeg',
    'Two of Cups': 'twoofcups.jpeg',
    'Three of Cups': 'threeofcups.jpeg',
    'Four of Cups': 'fourofcups.jpeg',
    'Five of Cups': 'fiveofcups.jpeg',
    'Six of Cups': 'sixofcups.jpeg',
    'Seven of Cups': 'sevenofcups.jpeg',
    'Eight of Cups': 'eightofcups.jpeg',
    'Nine of Cups': 'nineofcups.jpeg',
    'Ten of Cups': 'tenofcups.jpeg',
    'Page of Cups': 'pageofcups.jpeg',
    'Knight of Cups': 'knightofcups.jpeg',
    'Queen of Cups': 'queenofcups.jpeg',
    'King of Cups': 'kingofcups.jpeg',

    // Wands  
    'Ace of Wands': 'aceofwands.jpeg',
    'Two of Wands': 'twoofwands.jpeg',
    'Three of Wands': 'threeofwands.jpeg',
    'Four of Wands': 'fourofwands.jpeg',
    'Five of Wands': 'fiveofwands.jpeg',
    'Six of Wands': 'sixofwands.jpeg',
    'Seven of Wands': 'sevenofwands.jpeg',
    'Eight of Wands': 'eightofwands.jpeg',
    'Nine of Wands': 'nineofwands.jpeg',
    'Ten of Wands': 'tenofwands.jpeg',
    'Page of Wands': 'pageofwands.jpeg',
    'Knight of Wands': 'knightofwands.jpeg',
    'Queen of Wands': 'queenofwands.jpeg',
    'King of Wands': 'kingofwands.jpeg',

    // Swords
    'Ace of Swords': 'aceofswords.jpeg',
    'Two of Swords': 'twoofswords.jpeg',
    'Three of Swords': 'threeofswords.jpeg',
    'Four of Swords': 'fourofswords.jpeg',
    'Five of Swords': 'fiveofswords.jpeg',
    'Six of Swords': 'sixofswords.jpeg',
    'Seven of Swords': 'sevenofswords.jpeg',
    'Eight of Swords': 'eightofswords.jpeg',
    'Nine of Swords': 'nineofswords.jpeg',
    'Ten of Swords': 'tenofswords.jpeg',
    'Page of Swords': 'pageofswords.jpeg',
    'Knight of Swords': 'knightofswords.jpeg',
    'Queen of Swords': 'queenofswords.jpeg',
    'King of Swords': 'kingofswords.jpeg',

    // Pentacles
    'Ace of Pentacles': 'aceofpentacles.jpeg',
    'Two of Pentacles': 'twoofpentacles.jpeg',
    'Three of Pentacles': 'threeofpentacles.jpeg',
    'Four of Pentacles': 'fourofpentacles.jpeg',
    'Five of Pentacles': 'fiveofpentacles.jpeg',
    'Six of Pentacles': 'sixofpentacles.jpeg',
    'Seven of Pentacles': 'sevenofpentacles.jpeg',
    'Eight of Pentacles': 'eightofpentacles.jpeg',
    'Nine of Pentacles': 'nineofpentacles.jpeg',
    'Ten of Pentacles': 'tenofpentacles.jpeg',
    'Page of Pentacles': 'pageofpentacles.jpeg',
    'Knight of Pentacles': 'knightofpentacles.jpeg',
    'Queen of Pentacles': 'queenofpentacles.jpeg',
    'King of Pentacles': 'kingofpentacles.jpeg',
  };
  
  return fileMap[cardName];
};