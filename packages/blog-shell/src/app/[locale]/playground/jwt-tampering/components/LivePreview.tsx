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
    <div className="rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Eye className="w-5 h-5" />
          Live JWT Preview
        </h3>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
          Real-time token generation
        </p>
      </div>

      <div className="p-6">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Generated Token
            </label>
            <button
              onClick={() => onCopy(token, 0)}
              className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
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
          <div className="p-4 bg-gray-900 dark:bg-black rounded-lg border border-gray-300 dark:border-gray-700 overflow-x-auto">
            <code className="text-xs text-green-400 font-mono break-all">
              {token}
            </code>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
              Decoded Header
            </h4>
            <pre className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 text-xs text-blue-900 dark:text-blue-300 font-mono overflow-x-auto">
              {header}
            </pre>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
              Decoded Payload
            </h4>
            <pre className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800 text-xs text-purple-900 dark:text-purple-300 font-mono overflow-x-auto">
              {payload}
            </pre>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
              Signature
            </h4>
            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <code className="text-xs text-red-900 dark:text-red-300 font-mono break-all">
                {showSignature ? signature : '•'.repeat(signature.length)}
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
