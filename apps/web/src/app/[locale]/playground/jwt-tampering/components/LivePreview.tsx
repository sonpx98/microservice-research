'use client';

import { Eye, Copy, Check } from 'lucide-react';
import { Panel } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { CodeBlock } from '@/components/ui/code-block';

interface LivePreviewProps {
  token: string;
  header: string;
  payload: string;
  signature: string;
  showSignature: boolean;
  copiedId: number | null;
  onCopy: (text: string, id: number) => void;
}

export function LivePreview({
  token,
  header,
  payload,
  signature,
  showSignature,
  copiedId,
  onCopy,
}: LivePreviewProps) {
  return (
    <Panel
      title={
        <span className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-primary" />
          Live preview
        </span>
      }
      description="Token regenerated as you type"
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-foreground">Generated token</p>
            <Button variant="outline" size="sm" onClick={() => onCopy(token, 0)}>
              {copiedId === 0 ? <Check /> : <Copy />}
              {copiedId === 0 ? 'Copied' : 'Copy'}
            </Button>
          </div>
          <CodeBlock tone="success">{token}</CodeBlock>
        </div>

        {[
          { label: 'Decoded header', value: header, tone: 'primary' as const },
          { label: 'Decoded payload', value: payload, tone: 'primary' as const },
          { label: 'Signature', value: showSignature ? signature : '•'.repeat(signature.length), tone: 'danger' as const },
        ].map(({ label, value, tone }) => (
          <div key={label} className="flex flex-col gap-2">
            <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
            <CodeBlock tone={tone}>{value}</CodeBlock>
          </div>
        ))}
      </div>
    </Panel>
  );
}
