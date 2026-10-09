import { RotateCcw, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Attempt {
  id: number;
  username: string;
  password: string;
  result: {
    success: boolean;
    message: string;
  };
}

interface SQLAttemptsHistoryProps {
  attempts: Attempt[];
  onReset: () => void;
}

export function SQLAttemptsHistory({ attempts, onReset }: SQLAttemptsHistoryProps) {
  return (
    <div className="rounded-xl bg-card border border-border shadow-sm overflow-hidden">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground">
            Attempts ({attempts.length})
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </div>
      </div>

      <ScrollArea className="max-h-60">
        <div className="p-6 space-y-3">
          {attempts.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No attempts yet. Try to bypass the login!
            </p>
          ) : (
            attempts.map((attempt) => (
              <div 
                key={attempt.id}
                className={`p-3 rounded-lg border ${
                  attempt.result.success 
                    ? 'bg-success/10 border-success/30'
                    : 'bg-danger/10 border-danger/30'
                }`}
              >
                <div className="flex items-start gap-2">
                  {attempt.result.success ? (
                    <CheckCircle2 className="w-4 h-4 text-success mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-danger mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-mono text-foreground break-all">
                      User: <span className="text-warning">{attempt.username}</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{attempt.result.message}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
