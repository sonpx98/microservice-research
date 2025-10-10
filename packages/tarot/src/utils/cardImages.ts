// Import all tarot card images
import aceofcups from '../assets/images/aceofcups.jpeg';
import aceofpentacles from '../assets/images/aceofpentacles.jpeg';
import aceofswords from '../assets/images/aceofswords.jpeg';
import aceofwands from '../assets/images/aceofwands.jpeg';
import death from '../assets/images/death.jpeg';
import eightofcups from '../assets/images/eightofcups.jpeg';
import eightofpentacles from '../assets/images/eightofpentacles.jpeg';
import eightofswords from '../assets/images/eightofswords.jpeg';
import eightofwands from '../assets/images/eightofwands.jpeg';
import fiveofcups from '../assets/images/fiveofcups.jpeg';
import fiveofpentacles from '../assets/images/fiveofpentacles.jpeg';
import fiveofswords from '../assets/images/fiveofswords.jpeg';
import fiveofwands from '../assets/images/fiveofwands.jpeg';
import fourofcups from '../assets/images/fourofcups.jpeg';
import fourofpentacles from '../assets/images/fourofpentacles.jpeg';
import fourofswords from '../assets/images/fourofswords.jpeg';
import fourofwands from '../assets/images/fourofwands.jpeg';
import judgement from '../assets/images/judgement.jpeg';
import justice from '../assets/images/justice.jpeg';
import kingofcups from '../assets/images/kingofcups.jpeg';
import kingofpentacles from '../assets/images/kingofpentacles.jpeg';
import kingofswords from '../assets/images/kingofswords.jpeg';
import kingofwands from '../assets/images/kingofwands.jpeg';
import knightofcups from '../assets/images/knightofcups.jpeg';
import knightofpentacles from '../assets/images/knightofpentacles.jpeg';
import knightofswords from '../assets/images/knightofswords.jpeg';
import knightofwands from '../assets/images/knightofwands.jpeg';
import nineofcups from '../assets/images/nineofcups.jpeg';
import nineofpentacles from '../assets/images/nineofpentacles.jpeg';
import nineofswords from '../assets/images/nineofswords.jpeg';
import nineofwands from '../assets/images/nineofwands.jpeg';
import pageofcups from '../assets/images/pageofcups.jpeg';
import pageofpentacles from '../assets/images/pageofpentacles.jpeg';
import pageofswords from '../assets/images/pageofswords.jpeg';
import pageofwands from '../assets/images/pageofwands.jpeg';
import queenofcups from '../assets/images/queenofcups.jpeg';
import queenofpentacles from '../assets/images/queenofpentacles.jpeg';
import queenofswords from '../assets/images/queenofswords.jpeg';
import queenofwands from '../assets/images/queenofwands.jpeg';
import sevenofcups from '../assets/images/sevenofcups.jpeg';
import sevenofpentacles from '../assets/images/sevenofpentacles.jpeg';
import sevenofswords from '../assets/images/sevenofswords.jpeg';
import sevenofwands from '../assets/images/sevenofwands.jpeg';
import sixofcups from '../assets/images/sixofcups.jpeg';
import sixofpentacles from '../assets/images/sixofpentacles.jpeg';
import sixofswords from '../assets/images/sixofswords.jpeg';
import sixofwands from '../assets/images/sixofwands.jpeg';
import temperance from '../assets/images/temperance.jpeg';
import tenofcups from '../assets/images/tenofcups.jpeg';
import tenofpentacles from '../assets/images/tenofpentacles.jpeg';
import tenofswords from '../assets/images/tenofswords.jpeg';
import tenofwands from '../assets/images/tenofwands.jpeg';
import thechariot from '../assets/images/thechariot.jpeg';
import thedevil from '../assets/images/thedevil.jpeg';
import theemperor from '../assets/images/theemperor.jpeg';
import theempress from '../assets/images/theempress.jpeg';
import thefool from '../assets/images/thefool.jpeg';
import thehangedman from '../assets/images/thehangedman.jpeg';
import thehermit from '../assets/images/thehermit.jpeg';
import thehierophant from '../assets/images/thehierophant.jpeg';
import thehighpriestess from '../assets/images/thehighpriestess.jpeg';
import themagician from '../assets/images/themagician.jpeg';
import themoon from '../assets/images/themoon.jpeg';
import thestar from '../assets/images/thestar.jpeg';
import thestrength from '../assets/images/thestrength.jpeg';
import thesun from '../assets/images/thesun.jpeg';
import thetower from '../assets/images/thetower.jpeg';
import theworld from '../assets/images/theworld.jpeg';
import threeofcups from '../assets/images/threeofcups.jpeg';
import threeofpentacles from '../assets/images/threeofpentacles.jpeg';
import threeofswords from '../assets/images/threeofswords.jpeg';
import threeofwands from '../assets/images/threeofwands.jpeg';
import twoofcups from '../assets/images/twoofcups.jpeg';
import twoofpentacles from '../assets/images/twoofpentacles.jpeg';
import twoofswords from '../assets/images/twoofswords.jpeg';
import twoofwands from '../assets/images/twoofwands.jpeg';
import wheeloffortune from '../assets/images/wheeloffortune.jpeg';
import TheLovers from '../assets/images/TheLovers.jpg';

// Create mapping object from card names to image imports
export const TAROT_IMAGES: Record<string, string> = {
  // Major Arcana
  'The Fool': thefool,
  'The Magician': themagician,
  'The High Priestess': thehighpriestess,
  'The Empress': theempress,
  'The Emperor': theemperor,
  'The Hierophant': thehierophant,
  'The Lovers': TheLovers,
  'The Chariot': thechariot,
  'Strength': thestrength,
  'The Hermit': thehermit,
  'Wheel of Fortune': wheeloffortune,
  'Justice': justice,
  'The Hanged Man': thehangedman,
  'Death': death,
  'Temperance': temperance,
  'The Devil': thedevil,
  'The Tower': thetower,
  'The Star': thestar,
  'The Moon': themoon,
  'The Sun': thesun,
  'Judgement': judgement,
  'The World': theworld,

  // Cups
  'Ace of Cups': aceofcups,
  'Two of Cups': twoofcups,
  'Three of Cups': threeofcups,
  'Four of Cups': fourofcups,
  'Five of Cups': fiveofcups,
  'Six of Cups': sixofcups,
  'Seven of Cups': sevenofcups,
  'Eight of Cups': eightofcups,
  'Nine of Cups': nineofcups,
  'Ten of Cups': tenofcups,
  'Page of Cups': pageofcups,
  'Knight of Cups': knightofcups,
  'Queen of Cups': queenofcups,
  'King of Cups': kingofcups,

  // Wands
  'Ace of Wands': aceofwands,
  'Two of Wands': twoofwands,
  'Three of Wands': threeofwands,
  'Four of Wands': fourofwands,
  'Five of Wands': fiveofwands,
  'Six of Wands': sixofwands,
  'Seven of Wands': sevenofwands,
  'Eight of Wands': eightofwands,
  'Nine of Wands': nineofwands,
  'Ten of Wands': tenofwands,
  'Page of Wands': pageofwands,
  'Knight of Wands': knightofwands,
  'Queen of Wands': queenofwands,
  'King of Wands': kingofwands,

  // Swords
  'Ace of Swords': aceofswords,
  'Two of Swords': twoofswords,
  'Three of Swords': threeofswords,
  'Four of Swords': fourofswords,
  'Five of Swords': fiveofswords,
  'Six of Swords': sixofswords,
  'Seven of Swords': sevenofswords,
  'Eight of Swords': eightofswords,
  'Nine of Swords': nineofswords,
  'Ten of Swords': tenofswords,
  'Page of Swords': pageofswords,
  'Knight of Swords': knightofswords,
  'Queen of Swords': queenofswords,
  'King of Swords': kingofswords,

  // Pentacles
  'Ace of Pentacles': aceofpentacles,
  'Two of Pentacles': twoofpentacles,
  'Three of Pentacles': threeofpentacles,
  'Four of Pentacles': fourofpentacles,
  'Five of Pentacles': fiveofpentacles,
  'Six of Pentacles': sixofpentacles,
  'Seven of Pentacles': sevenofpentacles,
  'Eight of Pentacles': eightofpentacles,
  'Nine of Pentacles': nineofpentacles,
  'Ten of Pentacles': tenofpentacles,
  'Page of Pentacles': pageofpentacles,
  'Knight of Pentacles': knightofpentacles,
  'Queen of Pentacles': queenofpentacles,
  'King of Pentacles': kingofpentacles,
};

// Helper function to get image for a card
export const getCardImage = (cardName: string): string | undefined => {
  console.log('🔍 Looking for card:', cardName);
  
  // Get image filename
  const imageFileName = getImageFileName(cardName);
  if (!imageFileName) {
    console.log('❌ No filename found for:', cardName);
    return undefined;
  }

  // Check if we're in Module Federation mode (when consumed by host)
  const isModuleFederation = window.location.port !== '5003' && window.location.port !== '5005';
  
  if (isModuleFederation) {
    // Use remote public URL when consumed via Module Federation
    const remoteImageUrl = `http://localhost:5003/images/${imageFileName}`;
    console.log('🌐 Using remote public URL:', remoteImageUrl);
    return remoteImageUrl;
  } else {
    // Try local import first, then fallback to public URL
    const localImage = TAROT_IMAGES[cardName];
    if (localImage) {
      console.log('� Using local import:', localImage);
      return localImage;
    } else {
      // Fallback to public URL even in standalone mode
      const publicUrl = `/images/${imageFileName}`;
      console.log('📁 Using public URL:', publicUrl);
      return publicUrl;
    }
  }
};

// Helper to map card names to file names
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

// Helper to get all available card names
export const getAvailableCardNames = (): string[] => {
  return Object.keys(TAROT_IMAGES);
};