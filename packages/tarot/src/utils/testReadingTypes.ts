import type { ReadingType } from '../data/readingTypes';
import { readingTypes } from '../data/readingTypes';

export function testReadingTypes() {
  console.log('🔮 Testing Tarot Reading Types:');
  console.log('================================');
  
  readingTypes.forEach((type: ReadingType, index: number) => {
    console.log(`\n${index + 1}. ${type.icon} ${type.title}`);
    console.log(`   Description: ${type.description}`);
    console.log(`   Color: ${type.color}`);
    console.log(`   Interpretations:`);
    console.log(`   - Past: ${type.interpretation.past}`);
    console.log(`   - Present: ${type.interpretation.present}`);
    console.log(`   - Future: ${type.interpretation.future}`);
  });
  
  console.log('\n✨ All reading types loaded successfully!');
}

// Uncomment this line to test:
// testReadingTypes();