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
    <div className="rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Attempts ({attempts.length})
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </div>
      </div>

      <ScrollArea className="max-h-60">
        <div className="p-6 space-y-3">
          {attempts.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-500 py-8">
              No attempts yet. Try to bypass the login!
            </p>
          ) : (
            attempts.map((attempt) => (
              <div 
                key={attempt.id}
                className={`p-3 rounded-lg border ${
                  attempt.result.success 
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                    : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                }`}
              >
                <div className="flex items-start gap-2">
                  {attempt.result.success ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-mono text-gray-700 dark:text-gray-300 break-all">
                      User: <span className="text-orange-600 dark:text-orange-400">{attempt.username}</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{attempt.result.message}</p>
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
