'use client';

import { AlertTriangle, Check, CheckCircle2, Copy } from 'lucide-react';
import { Panel } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface LabAttempt {
  id: number;
  success: boolean;
  message: string;
  /** What the user sent; shown in mono and copyable when onCopy is given. */
  payload?: string;
  /** Extra line under the message, e.g. the user an injection logged in as. */
  detail?: React.ReactNode;
}

interface AttemptsHistoryProps {
  title: string;
  /** Newest first. */
  attempts: LabAttempt[];
  copiedId?: number | null;
  onCopy?: (text: string, id: number) => void;
}

export function AttemptsHistory({ title, attempts, copiedId, onCopy }: AttemptsHistoryProps) {
  if (attempts.length === 0) return null;

  return (
    <Panel title={title} description={`${attempts.length} attempt${attempts.length === 1 ? '' : 's'}`} padding="none">
      <ul className="max-h-96 divide-y divide-border overflow-y-auto">
        {attempts.map((a) => {
          const Icon = a.success ? CheckCircle2 : AlertTriangle;
          return (
            <li key={a.id} className="flex items-start gap-3 px-4 py-3">
              <Icon className={cn('mt-0.5 h-4 w-4 shrink-0', a.success ? 'text-success' : 'text-danger')} />
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <p className={cn('text-sm font-medium', a.success ? 'text-success' : 'text-danger')}>{a.message}</p>
                {a.detail && <div className="text-xs text-muted-foreground">{a.detail}</div>}
                {a.payload && (
                  <code className="line-clamp-2 break-all font-mono text-xs text-muted-foreground">{a.payload}</code>
                )}
              </div>
              {a.payload && onCopy && (
                <Button
                  size="icon-sm"
                  variant="ghost"
                  aria-label="Copy payload"
                  onClick={() => onCopy(a.payload!, a.id)}
                >
                  {copiedId === a.id ? <Check /> : <Copy />}
                </Button>
              )}
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}
