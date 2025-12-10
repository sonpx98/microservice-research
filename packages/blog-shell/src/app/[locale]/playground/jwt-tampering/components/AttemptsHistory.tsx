'use client';

import { Copy, CheckCircle2, AlertTriangle } from 'lucide-react';
import { JWTAttempt } from './types';

interface AttemptsHistoryProps {
  attempts: JWTAttempt[];
  copiedId: number | null;
  onCopy: (text: string, id: number) => void;
}

export function AttemptsHistory({
  attempts,
  copiedId,
  onCopy,
}: AttemptsHistoryProps) {
  if (attempts.length === 0) {
    return null;
  }

  return (
    <div className="mt-6 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <h3 className="font-semibold text-gray-900 dark:text-white">
          Forge Attempts ({attempts.length})
        </h3>
      </div>
      <div className="p-4">
        <div className="space-y-3">
          {attempts.slice().reverse().map((attempt) => (
            <div 
              key={attempt.id}
              className={`p-4 rounded-lg border ${
                attempt.result.success
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                  : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
              }`}
            >
              <div className="flex items-start justify-between gap-4 mb-2">
                <p className={`text-sm font-medium ${
                  attempt.result.success
                    ? 'text-green-800 dark:text-green-200'
                    : 'text-red-800 dark:text-red-200'
                }`}>
                  {attempt.result.success ? (
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      {attempt.result.message}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4" />
                      {attempt.result.message}
                    </span>
                  )}
                </p>
                <button
                  onClick={() => onCopy(attempt.token, attempt.id)}
                  className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
                >
                  {copiedId === attempt.id ? (
                    <CheckCircle2 className="w-3 h-3" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              </div>
              <code className={`text-xs font-mono block break-all ${
                attempt.result.success
                  ? 'text-green-700 dark:text-green-300'
                  : 'text-red-700 dark:text-red-300'
              }`}>
                {attempt.token}
              </code>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
