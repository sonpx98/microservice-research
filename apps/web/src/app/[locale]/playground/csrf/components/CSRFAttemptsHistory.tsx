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
    <div className="rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Attempts ({attempts.length})
          </h3>
          {attempts.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
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
            <p className="text-center text-gray-500 dark:text-gray-500 py-8">
              No attempts yet. Craft your first CSRF exploit!
            </p>
          ) : (
            attempts.map((attempt) => (
              <div 
                key={attempt.id}
                className={`p-4 rounded-lg border ${
                  attempt.result.success 
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                    : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  {attempt.result.success ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  )}
                  <button
                    onClick={() => onCopy(attempt.payload, attempt.id)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    title="Copy to clipboard"
                  >
                    {copiedId === attempt.id ? '✓ Copied' : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mb-2 font-mono">{attempt.payload.slice(0, 100)}...</p>
                <p className={`text-sm font-medium ${
                  attempt.result.success 
                    ? 'text-green-700 dark:text-green-300'
                    : 'text-red-700 dark:text-red-300'
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
