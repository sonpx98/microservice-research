import { setRequestLocale } from 'next-intl/server';
import { getKnowledgeGraphNodes } from '@/lib/knowledge-graph';
import { KnowledgeGraphView } from '@/components/knowledge-graph';
import { MemoryVisualizer } from '@/components/algo-verse/memory-visualizer';
import { FullBleedPage, ViewSwitch } from '@/components/layout';
import { EmptyState } from '@/components/ui/empty-state';
import { Network } from 'lucide-react';

// Concepts and the runtime that executes them live on one page: the graph links notes,
// the visualizer shows a note's example running in stack, heap and registers.
export default async function KnowledgeGraphPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ view?: string; example?: string }>;
}) {
  const { locale } = await params;
  const { view, example } = await searchParams;
  setRequestLocale(locale);

  const base = `/${locale}/knowledge-graph`;
  const isVisualizer = view === 'visualizer';
  const nodes = getKnowledgeGraphNodes();

  return (
    <FullBleedPage
      eyebrow="Knowledge"
      title="Knowledge Graph"
      description="Linked notes on how systems and runtimes work, with a visualizer that runs the examples step by step."
      actions={
        <ViewSwitch
          items={[
            { href: base, label: 'Graph', active: !isVisualizer },
            { href: `${base}?view=visualizer`, label: 'Visualizer', active: isVisualizer },
          ]}
        />
      }
      bodyClassName={isVisualizer ? 'bg-muted p-4' : 'bg-grid'}
    >
      {isVisualizer ? (
        <div className="mx-auto h-full max-w-6xl">
          <MemoryVisualizer key={example ?? 'default'} initialExampleId={example} />
        </div>
      ) : nodes.length > 0 ? (
        <KnowledgeGraphView nodes={nodes} />
      ) : (
        <EmptyState
          icon={Network}
          title="No notes yet"
          description="New notes are on the way. Meanwhile, open the visualizer and step through an example."
          className="h-full"
        />
      )}
    </FullBleedPage>
  );
}
