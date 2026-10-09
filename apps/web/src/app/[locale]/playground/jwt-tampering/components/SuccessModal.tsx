'use client';

import { Trophy, Code, AlertTriangle, Shield, CheckCircle2, ArrowLeft, PartyPopper } from 'lucide-react';
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
    <div className="mb-6 rounded-xl bg-success/10 border border-success/30 animate-in slide-in-from-top-4 overflow-hidden">
      <div className="p-6 border-b border-success/30">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-success flex items-center justify-center flex-shrink-0">
            <Trophy className="w-6 h-6 text-success-foreground" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-success mb-1">
              Level {currentLevel} Complete! <PartyPopper className="w-5 h-5 inline ml-1" />
            </h3>
            <p className="text-sm text-success">
              {explanation.attackName}
            </p>
          </div>
          {currentLevel < totalLevels && (
            <button
              onClick={onNext}
              className="px-4 py-2 bg-success hover:bg-success/90 text-success-foreground rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              Next Level
              <ArrowLeft className="w-4 h-4 rotate-180" />
            </button>
          )}
        </div>
      </div>

      <div className="p-6 border-b border-success/30 bg-success/10">
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-success mb-2 flex items-center gap-2">
              <Code className="w-4 h-4" />
              How It Works
            </h4>
            <p className="text-sm text-success">
              {explanation.howItWorks}
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-success mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Why It Succeeds
            </h4>
            <p className="text-sm text-success">
              {explanation.whyItSucceeds}
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-success mb-2 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Real-World Impact
            </h4>
            <p className="text-sm text-success">
              {explanation.realWorldImpact}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 bg-success/10">
        <h4 className="font-semibold text-success mb-3 flex items-center gap-2">
          <Shield className="w-4 h-4" /> Prevention Tips:
        </h4>
        <ul className="space-y-2">
          {explanation.preventionTips.map((tip, idx) => (
            <li key={idx} className="text-sm text-success flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
