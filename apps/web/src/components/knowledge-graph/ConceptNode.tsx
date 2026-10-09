import { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import { cn } from '@/lib/utils';

interface ConceptNodeData {
  label: string;
  type: string;
}

// Category marker colors: categorical tokens, so they follow the active theme.
const TONE: Record<string, string> = {
  technical: 'bg-chart-1',
  issue: 'bg-danger',
  slang: 'bg-chart-4',
};

export const ConceptNode = memo(function ConceptNode({ data, selected }: NodeProps<ConceptNodeData>) {
  return (
    <div
      className={cn(
        'flex max-w-44 cursor-pointer items-center gap-2 rounded-md border bg-card px-3 py-2 font-mono text-xs text-card-foreground shadow-sm transition-colors',
        selected ? 'border-primary ring-2 ring-ring/30' : 'border-border hover:border-primary',
      )}
    >
      <Handle type="target" position={Position.Left} className="opacity-0" />
      <span className={cn('h-2 w-2 shrink-0 rounded-full', TONE[data.type] ?? 'bg-muted-foreground')} />
      <span className="line-clamp-2">{data.label}</span>
      <Handle type="source" position={Position.Right} className="opacity-0" />
    </div>
  );
});
