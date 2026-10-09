'use client';

import { Code, Lightbulb, FileText } from 'lucide-react';
import { JWTLevel, JWTLevelExplanation } from './types';

interface LevelSelectorProps {
  level: JWTLevel;
  currentLevel: number;
  completedLevels: number[];
  showHint: boolean;
  showSolution: boolean;
  onHintToggle: () => void;
  onSolutionToggle: () => void;
  onLoadSolution: () => void;
  onGoToLevel: (levelId: number) => void;
  jwtLevelExplanations: Record<number, JWTLevelExplanation>;
  jwtSolutions: Record<number, string>;
  levels: JWTLevel[];
}

export function LevelSelector({
  level,
  currentLevel,
  completedLevels,
  showHint,
  showSolution,
  onHintToggle,
  onSolutionToggle,
  onLoadSolution,
  onGoToLevel,
  jwtLevelExplanations,
  jwtSolutions,
  levels,
}: LevelSelectorProps) {
  return (
    <div className="space-y-6">
      {/* Level Progress */}
      <div className="rounded-xl bg-card border border-border shadow-sm overflow-hidden p-6">
        <h3 className="font-semibold text-foreground mb-4">
          Progress ({completedLevels.length}/{levels.length})
        </h3>
        <div className="grid grid-cols-5 gap-2">
          {levels.map((lvl) => (
            <button
              key={lvl.id}
              onClick={() => onGoToLevel(lvl.id)}
              className={`p-3 rounded-lg text-center font-medium text-sm transition-all cursor-pointer hover:opacity-80 ${
                completedLevels.includes(lvl.id)
                  ? 'bg-success/10 text-success'
                  : currentLevel === lvl.id
                  ? 'bg-primary/10 text-primary'
                  : 'bg-muted text-muted-foreground hover:bg-accent'
              }`}
            >
              {lvl.id}
            </button>
          ))}
        </div>
      </div>

      {/* Current Level Info */}
      <div className="rounded-xl bg-card border border-border shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border bg-primary/10">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-foreground">
              {level.title}
            </h2>
            <p className="mt-2 text-foreground">
              {level.description}
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              <span className="font-medium">Scenario:</span> {level.scenario}
            </p>
          </div>
        </div>

        {/* Hint and Solution Buttons */}
        <div className="p-6 border-b border-border bg-muted flex gap-2 flex-wrap">
          <button
            onClick={onHintToggle}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              showHint 
                ? 'bg-warning/10 text-warning'
                : 'bg-muted text-muted-foreground hover:bg-accent'
            }`}
          >
            <Lightbulb className="w-4 h-4" />
            Hint
          </button>
          <button
            onClick={onSolutionToggle}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              showSolution 
                ? 'bg-primary/10 text-primary'
                : 'bg-muted text-muted-foreground hover:bg-accent'
            }`}
          >
            <Code className="w-4 h-4" />
            Solution
          </button>
        </div>

        {/* Hint Section */}
        {showHint && (
          <div className="p-6 border-b border-border bg-warning/10 border-l-4 border-l-warning">
            <p className="text-sm text-warning">
              <Lightbulb className="w-4 h-4 inline mr-1" /> <strong>Hint:</strong> {level.hint}
            </p>
          </div>
        )}

        {/* Solution Section */}
        {showSolution && (
          <div className="p-6 bg-primary/10">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-primary flex items-center gap-2">
                <FileText className="w-4 h-4" /> Solution for Level {currentLevel}
              </p>
              <button
                onClick={onLoadSolution}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-primary/20 text-primary rounded hover:bg-primary/90 transition-colors"
              >
                Load Solution
              </button>
            </div>
            <pre className="bg-background text-success p-4 rounded border border-primary/30 text-xs overflow-x-auto font-mono">
              {jwtSolutions[currentLevel]}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
