import { notFound } from 'next/navigation';
import { ArticleLayout } from '@/components/layout';
import { QuizSection } from '../../../../components/english-learning/quiz-section';
import { Calendar, Tag } from 'lucide-react';

async function getReading(id: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_GATEWAY_URL || 'http://localhost:3000/api'}/readings/${id}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  } catch (err) {
    return null;
  }
}

export default async function ReadingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const reading = await getReading(id);

  if (!reading) {
    notFound();
  }

  return (
    <ArticleLayout
      title={reading.title}
      meta={
        <>
          <span className="rounded border border-primary/30 px-1.5 py-0.5 text-primary">Level {reading.level}</span>
          <span className="inline-flex items-center gap-1">
            <Tag className="h-3.5 w-3.5" />
            {reading.topic}
          </span>
        </>
      }
    >
      {reading.content.split('\n\n').map((paragraph: string, idx: number) => (
        <p key={idx}>{paragraph.trim()}</p>
      ))}
      <div className="not-prose mt-12 border-t border-border pt-10">
        <QuizSection quizzes={reading.quizzes} />
      </div>
    </ArticleLayout>
  );
}
