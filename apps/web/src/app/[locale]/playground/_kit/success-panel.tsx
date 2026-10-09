import { AlertTriangle, ChevronRight, Code, Shield, Trophy } from 'lucide-react';
import { Callout, Panel } from '@/components/layout';
import { Button } from '@/components/ui/button';

export interface LabExplanation {
  attackName: string;
  howItWorks: string;
  whyItSucceeds: string;
  realWorldImpact: string;
  preventionTips?: string[];
}

interface SuccessPanelProps {
  /** Headline, e.g. "XSS attack succeeded". */
  title: string;
  currentLevel: number;
  totalLevels: number;
  explanation: LabExplanation;
  onNext: () => void;
  /** Shown after the last level instead of the Next button. */
  completeMessage: string;
}

const ROWS = [
  { key: 'howItWorks', label: 'How it works', icon: Code },
  { key: 'whyItSucceeds', label: 'Why it succeeded', icon: AlertTriangle },
  { key: 'realWorldImpact', label: 'Real-world impact', icon: Shield },
] as const;

export function SuccessPanel({ title, currentLevel, totalLevels, explanation, onNext, completeMessage }: SuccessPanelProps) {
  const isLast = currentLevel >= totalLevels;
  return (
    <Panel
      className="border-success/40 animate-in slide-in-from-top-2"
      title={
        <span className="flex items-center gap-2 text-success">
          <Trophy className="h-4 w-4" />
          {title}
        </span>
      }
      description={`Level ${currentLevel} · ${explanation.attackName}`}
      actions={
        !isLast && (
          <Button size="sm" onClick={onNext}>
            Next level
            <ChevronRight />
          </Button>
        )
      }
    >
      <dl className="flex flex-col gap-4">
        {ROWS.map(({ key, label, icon: Icon }) => (
          <div key={key} className="flex flex-col gap-1">
            <dt className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Icon className="h-4 w-4 text-success" />
              {label}
            </dt>
            <dd className="text-sm text-muted-foreground">{explanation[key]}</dd>
          </div>
        ))}
      </dl>

      {explanation.preventionTips && explanation.preventionTips.length > 0 && (
        <Callout tone="success" icon={Shield} title="Prevention" className="mt-4">
          <ul className="flex list-disc flex-col gap-1 pl-4">
            {explanation.preventionTips.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        </Callout>
      )}

      {isLast && (
        <Callout tone="success" icon={Trophy} className="mt-4">
          {completeMessage}
        </Callout>
      )}
    </Panel>
  );
}
