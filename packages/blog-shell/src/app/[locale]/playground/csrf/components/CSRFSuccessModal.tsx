import { Trophy, ChevronRight, Code, AlertTriangle, Shield, PartyPopper } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CSRFLevelExplanation {
  attackName: string;
  howItWorks: string;
  whyItSucceeds: string;
  realWorldImpact: string;
  preventionTips: string[];
}

interface CSRFSuccessModalProps {
  currentLevel: number;
  totalLevels: number;
  explanation: CSRFLevelExplanation;
  onNextLevel: () => void;
}

export function CSRFSuccessModal({
  currentLevel,
  totalLevels,
  explanation,
  onNextLevel,
}: CSRFSuccessModalProps) {
  return (
    <div className="mb-6 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 animate-in slide-in-from-top-4 overflow-hidden">
      {/* Success Header */}
      <div className="p-6 border-b border-green-200 dark:border-green-800">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center flex-shrink-0">
            <Trophy className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-1 flex items-center gap-2">
              <PartyPopper className="w-5 h-5" /> CSRF Attack Successful!
            </h3>
            <p className="text-green-700 dark:text-green-300 text-sm">
              You&apos;ve successfully demonstrated the CSRF vulnerability in Level {currentLevel}!
            </p>
          </div>
        </div>
      </div>

      {/* Attack Explanation */}
      <div className="p-6 border-b border-green-200 dark:border-green-800 bg-green-100/30 dark:bg-green-900/10">
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2 flex items-center gap-2">
              <Code className="w-4 h-4" />
              {explanation.attackName}
            </h4>
            <p className="text-sm text-green-800 dark:text-green-200 leading-relaxed">
              {explanation.howItWorks}
            </p>
          </div>

          <div className="pt-2 border-t border-green-300 dark:border-green-800/50">
            <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Why It Succeeded
            </h4>
            <p className="text-sm text-green-800 dark:text-green-200 leading-relaxed">
              {explanation.whyItSucceeds}
            </p>
          </div>

          <div className="pt-2 border-t border-green-300 dark:border-green-800/50">
            <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Real-World Impact
            </h4>
            <p className="text-sm text-green-800 dark:text-green-200 leading-relaxed">
              {explanation.realWorldImpact}
            </p>
          </div>

          <div className="pt-2 border-t border-green-300 dark:border-green-800/50">
            <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">Prevention Tips</h4>
            <ul className="space-y-2">
              {explanation.preventionTips.map((tip, idx) => (
                <li key={idx} className="text-sm text-green-800 dark:text-green-200 flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-600 mt-1.5 flex-shrink-0" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-6">
        {currentLevel < totalLevels ? (
          <Button onClick={onNextLevel} className="bg-green-600 hover:bg-green-700">
            Next Level
            <ChevronRight className="w-4 h-4" />
          </Button>
        ) : (
          <div className="p-4 rounded-lg bg-green-100 dark:bg-green-900/30">
            <p className="text-green-800 dark:text-green-200 font-medium flex items-center gap-2">
              <Trophy className="w-5 h-5" /> Congratulations! You&apos;ve completed all CSRF challenges!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
