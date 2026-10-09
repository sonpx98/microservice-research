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
    <div className="mt-6 rounded-xl bg-card border border-border shadow-sm overflow-hidden">
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold text-foreground">
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
                  ? 'bg-success/10 border-success/30'
                  : 'bg-danger/10 border-danger/30'
              }`}
            >
              <div className="flex items-start justify-between gap-4 mb-2">
                <p className={`text-sm font-medium ${
                  attempt.result.success
                    ? 'text-success'
                    : 'text-danger'
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
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
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
                  ? 'text-success'
                  : 'text-danger'
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
