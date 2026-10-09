'use client';

import { Code, Lightbulb } from 'lucide-react';
import { Callout, Panel } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { CodeBlock } from '@/components/ui/code-block';
import { cn } from '@/lib/utils';

export interface LabLevel {
  id: number;
  title: string;
  description: string;
  hint: string;
  scenario?: string;
}

export interface LabSolution {
  code: string;
  visible: boolean;
  onToggle: () => void;
  /** Copies the solution into the lab's inputs. */
  onLoad?: () => void;
}

interface LevelSelectorProps {
  levels: LabLevel[];
  currentLevel: number;
  completedLevels: number[];
  showHint: boolean;
  onHintToggle: () => void;
  onGoToLevel: (levelId: number) => void;
  solution?: LabSolution;
}

export function LevelSelector({
  levels,
  currentLevel,
  completedLevels,
  showHint,
  onHintToggle,
  onGoToLevel,
  solution,
}: LevelSelectorProps) {
  const level = levels.find((l) => l.id === currentLevel) ?? levels[0];

  return (
    <div className="flex flex-col gap-4">
      <Panel title="Progress" description={`${completedLevels.length} of ${levels.length} solved`} padding="sm">
        <div className="grid grid-cols-5 gap-2">
          {levels.map((l) => {
            const isCurrent = l.id === currentLevel;
            const isDone = completedLevels.includes(l.id);
            return (
              <Button
                key={l.id}
                size="sm"
                variant={isCurrent ? 'default' : isDone ? 'secondary' : 'outline'}
                className={cn('font-mono', isDone && !isCurrent && 'text-success')}
                onClick={() => onGoToLevel(l.id)}
                aria-current={isCurrent ? 'step' : undefined}
              >
                {l.id}
              </Button>
            );
          })}
        </div>
      </Panel>

      <Panel title={`Level ${level.id} · ${level.title}`}>
        <p className="text-sm text-foreground">{level.description}</p>
        {level.scenario && (
          <p className="mt-3 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Scenario:</span> {level.scenario}
          </p>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          <Button size="sm" variant={showHint ? 'secondary' : 'outline'} onClick={onHintToggle}>
            <Lightbulb />
            Hint
          </Button>
          {solution && (
            <Button size="sm" variant={solution.visible ? 'secondary' : 'outline'} onClick={solution.onToggle}>
              <Code />
              Solution
            </Button>
          )}
        </div>

        {showHint && (
          <Callout tone="warning" icon={Lightbulb} title="Hint" className="mt-4">
            {level.hint}
          </Callout>
        )}

        {solution?.visible && (
          <div className="mt-4 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <p className="font-mono text-xs text-muted-foreground">Solution · level {level.id}</p>
              {solution.onLoad && (
                <Button size="sm" variant="ghost" onClick={solution.onLoad}>
                  Load into form
                </Button>
              )}
            </div>
            <CodeBlock tone="success">{solution.code}</CodeBlock>
          </div>
        )}
      </Panel>
    </div>
  );
}
