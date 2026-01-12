'use client';

import { getKnowledgeGraphNodes } from '@/lib/knowledge-graph';
import { KnowledgeGraphView } from '@/components/knowledge-graph';

export default function KnowledgeGraphPage() {
  const nodes = getKnowledgeGraphNodes();
  
  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Page header */}
      <div className="container flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 mx-auto max-w-7xl">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Knowledge Graph
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Explore interconnected concepts, issues, and domain knowledge
        </p>
      </div>
      
      {/* Graph container - takes remaining space */}
      <div className="flex-1 min-h-0">
        <KnowledgeGraphView nodes={nodes} />
      </div>
    </div>
  );
}
