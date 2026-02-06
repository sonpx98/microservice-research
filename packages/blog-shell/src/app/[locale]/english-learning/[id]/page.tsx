import { notFound } from 'next/navigation';
import { QuizSection } from '../../../../components/english-learning/quiz-section';
import { Calendar, Tag } from 'lucide-react';

async function getReading(id: string) {
  try {
    const res = await fetch(`http://localhost:8080/api/readings/${id}`, { cache: 'no-store' });
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
    <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
                 <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300`}>
                    Level {reading.level}
                </span>
                <span className="flex items-center text-sm text-slate-500">
                    <Tag className="w-4 h-4 mr-1" />
                    {reading.topic}
                </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-6 leading-tight">
                {reading.title}
            </h1>
        </div>

      <article className="prose prose-slate dark:prose-invert lg:prose-lg max-w-none mb-12">
        <div className="text-slate-800 dark:text-slate-200">
            {reading.content.split('\n\n').map((paragraph: string, idx: number) => (
                <p key={idx} className="mb-4 leading-relaxed">
                    {paragraph.trim()}
                </p>
            ))}
        </div>
      </article>

      <hr className="border-slate-200 dark:border-slate-800 my-10" />

      <QuizSection quizzes={reading.quizzes} />
    </div>
  );
}
