import Link from 'next/link';
import { BookOpen, BarChart } from 'lucide-react';
import { ReadingSearchFilter } from '../../../components/english-learning/reading-search-filter';
import { EnglishHero } from '../../../components/english-learning/english-hero';

const TOPICS = ['Technology', 'Science', 'Culture', 'History', 'Nature', 'Health'];
const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

async function getReadings(level?: string, topic?: string, q?: string) {
  try {
    const params = new URLSearchParams();
    if (level) params.append('level', level);
    if (topic) params.append('topic', topic);
    if (q) params.append('q', q);
    
    // Default limit 6 for initial load
    params.append('limit', '6');
    
    // API now returns { data: [], total: ... }
    const res = await fetch(`http://localhost:8080/api/readings?${params.toString()}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch readings');
    return res.json();
  } catch (err) {
    console.error(err);
    return { data: [], total: 0 };
  }
}

import { ReadingList } from '../../../components/english-learning/reading-list';

export default async function EnglishLearningPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedSearchParams = await searchParams;
  const level = typeof resolvedSearchParams.level === 'string' ? resolvedSearchParams.level : undefined;
  const topic = typeof resolvedSearchParams.topic === 'string' ? resolvedSearchParams.topic : undefined;
  const q = typeof resolvedSearchParams.q === 'string' ? resolvedSearchParams.q : undefined;
  
  const { data: readings, total } = await getReadings(level, topic, q);

  const taglines = [
      "Improve your reading skills with AI",
      "Tailored content for every level",
      "Interactive quizzes and feedback",
      "Master English today"
  ];

  return (
    <div className="min-h-screen pb-20">
      <EnglishHero 
        title="English Learning Hub"
        taglines={taglines}
      />
      
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Navigation Tabs */}
        <div className="flex gap-4 mb-8">
          <Link 
            href="/en/english-learning" 
            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium shadow-lg"
          >
            <BookOpen size={20} />
            Readings
          </Link>
          <Link 
            href="/en/english-learning/conversation" 
            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 transition-colors border border-gray-700"
          >
            <BarChart size={20} />
            Conversations
          </Link>
        </div>

        <ReadingSearchFilter topics={TOPICS} levels={LEVELS} />

        <ReadingList readings={readings} initialTotal={total} />
      </div>
    </div>
  );
}
