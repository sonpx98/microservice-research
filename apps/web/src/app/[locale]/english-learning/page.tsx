import { ReadingSearchFilter } from '../../../components/english-learning/reading-search-filter';
import { EnglishShell } from '@/components/english-learning/english-shell';

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
    const res = await fetch(`${process.env.NEXT_PUBLIC_GATEWAY_URL || 'http://localhost:3000/api'}/readings?${params.toString()}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch readings');
    // await, or a JSON parse failure escapes the try and 500s the page
    return await res.json();
  } catch (err) {
    console.error(err);
    return { data: [], total: 0 };
  }
}

import { ReadingList } from '../../../components/english-learning/reading-list';

export default async function EnglishLearningPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { locale } = await params;
  const resolvedSearchParams = await searchParams;
  const level = typeof resolvedSearchParams.level === 'string' ? resolvedSearchParams.level : undefined;
  const topic = typeof resolvedSearchParams.topic === 'string' ? resolvedSearchParams.topic : undefined;
  const q = typeof resolvedSearchParams.q === 'string' ? resolvedSearchParams.q : undefined;
  
  const { data: readings, total } = await getReadings(level, topic, q);

  return (
    <EnglishShell
      locale={locale}
      active="readings"
      title="Readings"
      description="Graded reading passages from A1 to C2, each with a short quiz."
    >
        <ReadingSearchFilter topics={TOPICS} levels={LEVELS} />

        <ReadingList readings={readings} initialTotal={total} />
    </EnglishShell>
  );
}
