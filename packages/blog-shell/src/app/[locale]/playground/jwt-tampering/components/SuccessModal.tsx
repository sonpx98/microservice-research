'use client';

import { Trophy, Code, AlertTriangle, Shield, CheckCircle2, ArrowLeft } from 'lucide-react';
import { JWTLevelExplanation } from './types';

interface SuccessModalProps {
  currentLevel: number;
  totalLevels: number;
  explanation: JWTLevelExplanation;
  onNext: () => void;
}

export function SuccessModal({
  currentLevel,
  totalLevels,
  explanation,
  onNext,
}: SuccessModalProps) {
  return (
    <div className="mb-6 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 animate-in slide-in-from-top-4 overflow-hidden">
      <div className="p-6 border-b border-green-200 dark:border-green-800">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center flex-shrink-0">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-green-900 dark:text-green-100 mb-1">
              Level {currentLevel} Complete! 🎉
            </h3>
            <p className="text-sm text-green-700 dark:text-green-300">
              {explanation.attackName}
            </p>
          </div>
          {currentLevel < totalLevels && (
            <button
              onClick={onNext}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              Next Level
              <ArrowLeft className="w-4 h-4 rotate-180" />
            </button>
          )}
        </div>
      </div>

      <div className="p-6 border-b border-green-200 dark:border-green-800 bg-green-100/30 dark:bg-green-900/10">
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2 flex items-center gap-2">
              <Code className="w-4 h-4" />
              How It Works
            </h4>
            <p className="text-sm text-green-800 dark:text-green-200">
              {explanation.howItWorks}
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Why It Succeeds
            </h4>
            <p className="text-sm text-green-800 dark:text-green-200">
              {explanation.whyItSucceeds}
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Real-World Impact
            </h4>
            <p className="text-sm text-green-800 dark:text-green-200">
              {explanation.realWorldImpact}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 bg-green-50 dark:bg-green-900/5">
        <h4 className="font-semibold text-green-900 dark:text-green-100 mb-3">
          🛡️ Prevention Tips:
        </h4>
        <ul className="space-y-2">
          {explanation.preventionTips.map((tip, idx) => (
            <li key={idx} className="text-sm text-green-800 dark:text-green-200 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
