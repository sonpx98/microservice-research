'use client';

import { RotateCcw, Zap, Eye, EyeOff, KeyRound } from 'lucide-react';
import { Panel } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

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
    <Panel
      title={
        <span className="flex items-center gap-2">
          <KeyRound className="h-4 w-4 text-primary" />
          Token forger
        </span>
      }
      description="Modify header, payload and signature"
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-2 text-sm font-medium text-foreground">
          Header (JSON)
          <Textarea
            value={header}
            onChange={(e) => onHeaderChange(e.target.value)}
            className="font-mono"
            rows={4}
            placeholder='{"alg": "HS256", "typ": "JWT"}'
          />
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-foreground">
          Payload (JSON)
          <Textarea
            value={payload}
            onChange={(e) => onPayloadChange(e.target.value)}
            className="font-mono"
            rows={5}
            placeholder='{"user": "guest", "role": "user"}'
          />
        </label>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-sm font-medium text-foreground">
            <span>Signature</span>
            <Button type="button" variant="ghost" size="sm" onClick={onShowSignatureToggle}>
              {showSignature ? <EyeOff /> : <Eye />}
              {showSignature ? 'Hide' : 'Show'}
            </Button>
          </div>
          <Input
            type={showSignature ? 'text' : 'password'}
            value={signature}
            onChange={(e) => onSignatureChange(e.target.value)}
            className="font-mono"
            placeholder="signature_here"
            aria-label="Signature"
          />
        </div>

        <div className="flex gap-2 pt-2">
          <Button type="submit" className="flex-1">
            <Zap />
            Forge token
          </Button>
          <Button type="button" variant="outline" size="icon" onClick={onReset} aria-label="Reset level">
            <RotateCcw />
          </Button>
        </div>
      </form>
    </Panel>
  );
}
