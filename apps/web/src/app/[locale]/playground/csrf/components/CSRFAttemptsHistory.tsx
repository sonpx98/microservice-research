import { RotateCcw, CheckCircle2, AlertTriangle, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Attempt {
  id: number;
  payload: string;
  result: {
    success: boolean;
    message: string;
  };
}

interface CSRFAttemptsHistoryProps {
  attempts: Attempt[];
  copiedId: number | null;
  onReset: () => void;
  onCopy: (text: string, id: number) => void;
}

export function CSRFAttemptsHistory({ 
  attempts, 
  copiedId,
  onReset, 
  onCopy 
}: CSRFAttemptsHistoryProps) {
  return (
    <div className="rounded-xl bg-card border border-border shadow-sm overflow-hidden">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground">
            Attempts ({attempts.length})
          </h3>
          {attempts.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          )}
        </div>
      </div>

      <ScrollArea className="max-h-64">
        <div className="p-6 space-y-3">
          {attempts.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No attempts yet. Craft your first CSRF exploit!
            </p>
          ) : (
            attempts.map((attempt) => (
              <div 
                key={attempt.id}
                className={`p-4 rounded-lg border ${
                  attempt.result.success 
                    ? 'bg-success/10 border-success/30'
                    : 'bg-danger/10 border-danger/30'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  {attempt.result.success ? (
                    <CheckCircle2 className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-danger mt-0.5 flex-shrink-0" />
                  )}
                  <button
                    onClick={() => onCopy(attempt.payload, attempt.id)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    title="Copy to clipboard"
                  >
                    {copiedId === attempt.id ? '✓ Copied' : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mb-2 font-mono">{attempt.payload.slice(0, 100)}...</p>
                <p className={`text-sm font-medium ${
                  attempt.result.success 
                    ? 'text-success'
                    : 'text-danger'
                }`}>
                  {attempt.result.message}
                </p>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
