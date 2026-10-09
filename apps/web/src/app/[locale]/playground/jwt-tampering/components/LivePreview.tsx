'use client';

import { Eye, Copy, CheckCircle2 } from 'lucide-react';

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
    <div className="rounded-xl bg-card border border-border shadow-sm overflow-hidden">
      <div className="p-4 border-b border-border bg-primary/10">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Eye className="w-5 h-5" />
          Live JWT Preview
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          Real-time token generation
        </p>
      </div>

      <div className="p-6">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-foreground">
              Generated Token
            </label>
            <button
              onClick={() => onCopy(token, 0)}
              className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium bg-border text-foreground rounded hover:bg-accent transition-colors"
            >
              {copiedId === 0 ? (
                <>
                  <CheckCircle2 className="w-3 h-3" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  Copy
                </>
              )}
            </button>
          </div>
          <div className="p-4 bg-background rounded-lg border border-input overflow-x-auto">
            <code className="text-xs text-success font-mono break-all">
              {token}
            </code>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Decoded Header
            </h4>
            <pre className="p-3 bg-primary/10 rounded-lg border border-primary/30 text-xs text-primary font-mono overflow-x-auto">
              {header}
            </pre>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Decoded Payload
            </h4>
            <pre className="p-3 bg-primary/10 rounded-lg border border-primary/30 text-xs text-primary font-mono overflow-x-auto">
              {payload}
            </pre>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Signature
            </h4>
            <div className="p-3 bg-danger/10 rounded-lg border border-danger/30">
              <code className="text-xs text-danger font-mono break-all">
                {showSignature ? signature : '•'.repeat(signature.length)}
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
