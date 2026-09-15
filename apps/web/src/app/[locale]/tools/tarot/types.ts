export interface TarotCard {
    id: number;
    name: string;
    suit: 'Major Arcana' | 'Cups' | 'Wands' | 'Swords' | 'Pentacles';
    meaning: {
        upright: string;
        reversed: string;
    };
    description: string;
    keywords: string[];
}

export interface ReadingType {
    id: string;
    title: string;
    description: string;
    icon: string;
    color: 'purple' | 'pink' | 'blue' | 'green' | 'red' | 'yellow';
    interpretation: {
        past: string;
        present: string;
        future: string;
    };
}

export type AppState = 'select-type' | 'select-cards' | 'reveal' | 'reading';

export interface TarotReading {
    theme: string;
    journey: string;
    advice: string;
    energy: string;
}
