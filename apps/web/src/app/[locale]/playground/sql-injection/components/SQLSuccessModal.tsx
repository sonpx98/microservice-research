import { Trophy, ChevronRight, Code, AlertTriangle, Shield, PartyPopper } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LevelExplanation {
  attackName: string;
  howItWorks: string;
  whyItSucceeds: string;
  realWorldImpact: string;
}

interface SQLSuccessModalProps {
  currentLevel: number;
  totalLevels: number;
  explanation: LevelExplanation;
  onNextLevel: () => void;
}

export function SQLSuccessModal({
  currentLevel,
  totalLevels,
  explanation,
  onNextLevel,
}: SQLSuccessModalProps) {
  return (
    <div className="mb-6 rounded-xl bg-success/10 border border-success/30 animate-in slide-in-from-top-4 overflow-hidden">
      {/* Success Header */}
      <div className="p-6 border-b border-success/30">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
            <Trophy className="w-6 h-6 text-success" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-success mb-1 flex items-center gap-2">
              <PartyPopper className="w-5 h-5" /> SQL Injection Successful!
            </h3>
            <p className="text-success text-sm">
              You&apos;ve successfully exploited the SQL vulnerability in Level {currentLevel}!
            </p>
          </div>
        </div>
      </div>

      {/* Attack Explanation */}
      <div className="p-6 border-b border-success/30 bg-success/10">
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-success mb-2 flex items-center gap-2">
              <Code className="w-4 h-4" />
              {explanation.attackName}
            </h4>
            <p className="text-sm text-success leading-relaxed">
              {explanation.howItWorks}
            </p>
          </div>

          <div className="pt-2 border-t border-success/30">
            <h4 className="font-semibold text-success mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Why It Succeeded
            </h4>
            <p className="text-sm text-success leading-relaxed">
              {explanation.whyItSucceeds}
            </p>
          </div>

          <div className="pt-2 border-t border-success/30">
            <h4 className="font-semibold text-success mb-2 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Real-World Impact
            </h4>
            <p className="text-sm text-success leading-relaxed">
              {explanation.realWorldImpact}
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-6">
        {currentLevel < totalLevels ? (
          <Button onClick={onNextLevel} className="bg-success hover:bg-success/90">
            Next Level
            <ChevronRight className="w-4 h-4" />
          </Button>
        ) : (
          <div className="p-4 rounded-lg bg-success/10">
            <p className="text-success font-medium flex items-center gap-2">
              <Trophy className="w-5 h-5" /> Congratulations! You&apos;ve completed all SQL Injection challenges!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
