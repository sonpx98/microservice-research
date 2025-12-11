import React from 'react';
import { X } from 'lucide-react';
import { KnowledgeGraphNode } from 'contentlayer/generated';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { Relationship } from '@/lib/knowledge-graph';

interface NodeDetailProps {
  node: KnowledgeGraphNode;
  onClose?: () => void;
  onRelationshipClick?: (nodeId: string) => void;
}

const typeColors = {
  technical: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  issue: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  slang: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
};

export function NodeDetail({ node, onClose, onRelationshipClick }: NodeDetailProps) {
  const nodeType = (node as any).category?.toLowerCase() || 'technical';
  const relationships = ((node as any).relationships as Relationship[] | undefined) || [];

  return (
    <div className="flex flex-col h-full">
      {/* Header with close button */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
          {node.title}
        </h2>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            title="Close panel (Esc or click again)"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-4">
          <div>
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
                    className="text-sm"
                  >
                    <button
                      onClick={() => onRelationshipClick?.(rel.id)}
                      className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline cursor-pointer transition-colors"
                      title={`Navigate to ${rel.id}`}
                    >
                      {rel.id}
                    </button>
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
