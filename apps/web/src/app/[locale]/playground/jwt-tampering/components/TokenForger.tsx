'use client';

import { RotateCcw, Zap, Eye, EyeOff } from 'lucide-react';

interface TokenForgerProps {
  header: string;
  payload: string;
  signature: string;
  showSignature: boolean;
  onHeaderChange: (value: string) => void;
  onPayloadChange: (value: string) => void;
  onSignatureChange: (value: string) => void;
  onShowSignatureToggle: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onReset: () => void;
}

export function TokenForger({
  header,
  payload,
  signature,
  showSignature,
  onHeaderChange,
  onPayloadChange,
  onSignatureChange,
  onShowSignatureToggle,
  onSubmit,
  onReset,
}: TokenForgerProps) {
  return (
    <div className="rounded-xl bg-card border border-border shadow-sm overflow-hidden">
      <div className="p-4 border-b border-border bg-primary/10">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <span className="text-lg">🔐</span>
          JWT Token Forger
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          Modify header, payload, and signature
        </p>
      </div>

      <form onSubmit={onSubmit} className="p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Header (JSON)
          </label>
          <textarea
            value={header}
            onChange={(e) => onHeaderChange(e.target.value)}
            className="w-full px-3 py-2 border border-input rounded-lg bg-card text-foreground font-mono text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
            rows={4}
            placeholder='{"alg": "HS256", "typ": "JWT"}'
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Payload (JSON)
          </label>
          <textarea
            value={payload}
            onChange={(e) => onPayloadChange(e.target.value)}
            className="w-full px-3 py-2 border border-input rounded-lg bg-card text-foreground font-mono text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
            rows={5}
            placeholder='{"user": "guest", "role": "user"}'
          />
        </div>

        <div>
          <label className="flex items-center justify-between text-sm font-medium text-foreground mb-2">
            <span>Signature</span>
            <button
              type="button"
              onClick={onShowSignatureToggle}
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              {showSignature ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              {showSignature ? 'Hide' : 'Show'}
            </button>
          </label>
          <input
            type={showSignature ? 'text' : 'password'}
            value={signature}
            onChange={(e) => onSignatureChange(e.target.value)}
            className="w-full px-3 py-2 border border-input rounded-lg bg-card text-foreground font-mono text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="signature_here"
          />
        </div>

        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            className="flex-1 px-4 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-all flex items-center justify-center gap-2"
          >
            <Zap className="w-4 h-4" />
            Forge Token
          </button>
          <button
            type="button"
            onClick={onReset}
            className="px-4 py-3 bg-muted hover:bg-accent text-foreground rounded-lg font-medium transition-all flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
