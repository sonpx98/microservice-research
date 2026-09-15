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
    <div className="rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-blue-500/10 to-cyan-500/10">
        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <span className="text-lg">🔐</span>
          JWT Token Forger
        </h3>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
          Modify header, payload, and signature
        </p>
      </div>

      <form onSubmit={onSubmit} className="p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Header (JSON)
          </label>
          <textarea
            value={header}
            onChange={(e) => onHeaderChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={4}
            placeholder='{"alg": "HS256", "typ": "JWT"}'
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Payload (JSON)
          </label>
          <textarea
            value={payload}
            onChange={(e) => onPayloadChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={5}
            placeholder='{"user": "guest", "role": "user"}'
          />
        </div>

        <div>
          <label className="flex items-center justify-between text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <span>Signature</span>
            <button
              type="button"
              onClick={onShowSignatureToggle}
              className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 flex items-center gap-1"
            >
              {showSignature ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              {showSignature ? 'Hide' : 'Show'}
            </button>
          </label>
          <input
            type={showSignature ? 'text' : 'password'}
            value={signature}
            onChange={(e) => onSignatureChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="signature_here"
          />
        </div>

        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2"
          >
            <Zap className="w-4 h-4" />
            Forge Token
          </button>
          <button
            type="button"
            onClick={onReset}
            className="px-4 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-all flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
