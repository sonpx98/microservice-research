import React from 'react';
import Link from 'next/link';
import { Play, X } from 'lucide-react';
import { KnowledgeGraphNode } from 'contentlayer/generated';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import type { Relationship } from '@/lib/knowledge-graph';
import { sanitizeHtml } from '@/lib/sanitize';

interface NodeDetailProps {
  node: KnowledgeGraphNode;
  onClose?: () => void;
  onRelationshipClick?: (nodeId: string) => void;
}

const typeColors = {
  technical: 'bg-chart-1/10 text-chart-1',
  issue: 'bg-danger/10 text-danger',
  slang: 'bg-chart-4/10 text-chart-4',
};

export function NodeDetail({ node, onClose, onRelationshipClick }: NodeDetailProps) {
  const nodeType = (node as any).category?.toLowerCase() || 'technical';
  const relationships = ((node as any).relationships as Relationship[] | undefined) || [];

  return (
    <div className="flex flex-col h-full">
      {/* Header with close button */}
      <div className="flex items-center justify-between gap-3 border-b border-border px-6 py-4">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">{node.title}</h2>
        {onClose && (
          <Button variant="ghost" size="icon-sm" onClick={onClose} aria-label="Close panel" title="Close panel (Esc)">
            <X />
          </Button>
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

          {node.visualize && (
            <Link
              href={`?view=visualizer&example=${encodeURIComponent(node.visualize)}`}
              className={buttonVariants({ size: 'sm' })}
            >
              <Play />
              Run in visualizer
            </Link>
          )}

          <Separator />

          {node.tags && node.tags.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2">
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
              <h3 className="text-sm font-semibold text-foreground mb-2">
                Relationships
              </h3>
              <ul className="space-y-1">
                {relationships.map((rel) => (
                  <li
                    key={`${rel.id}-${rel.type}`}
                    className="text-sm"
                  >
                    <Button
                      variant="link"
                      size="sm"
                      className="h-auto p-0"
                      onClick={() => onRelationshipClick?.(rel.id)}
                      title={`Navigate to ${rel.id}`}
                    >
                      {rel.id}
                    </Button>
                    <span className="text-muted-foreground mx-2">→</span>
                    <span className="italic text-muted-foreground">{rel.type}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <Separator />

          <div className="prose prose-sm max-w-none">
            <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(node.body.html) }} />
          </div>
        </div>
      </div>
    </div>
  );
}
