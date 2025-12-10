import React from 'react';
import { KnowledgeGraphNode } from 'contentlayer/generated';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { Relationship } from '@/lib/knowledge-graph';

interface NodeDetailProps {
  node: KnowledgeGraphNode;
}

const typeColors = {
  technical: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  issue: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  slang: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
};

export function NodeDetail({ node }: NodeDetailProps) {
  const nodeType = (node as any).category?.toLowerCase() || 'technical';
  const relationships = ((node as any).relationships as Relationship[] | undefined) || [];

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {node.title}
            </h2>
            <Badge className={typeColors[nodeType as keyof typeof typeColors] || typeColors.technical}>
              {nodeType}
            </Badge>
          </div>

          <Separator />

          {node.tags && node.tags.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {node.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {relationships && relationships.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Relationships
              </h3>
              <ul className="space-y-1">
                {relationships.map((rel) => (
                  <li
                    key={`${rel.id}-${rel.type}`}
                    className="text-sm text-gray-600 dark:text-gray-400"
                  >
                    <span className="font-medium">{rel.id}</span>
                    <span className="text-gray-400 mx-2">→</span>
                    <span className="italic text-gray-500">{rel.type}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <Separator />

          <div className="prose dark:prose-invert prose-sm max-w-none">
            <div dangerouslySetInnerHTML={{ __html: node.body.html }} />
          </div>
        </div>
      </div>
    </div>
  );
}
