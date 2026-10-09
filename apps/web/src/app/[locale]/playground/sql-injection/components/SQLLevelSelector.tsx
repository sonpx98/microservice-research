'use client';

import { Lightbulb } from 'lucide-react';
import { SQLLevel } from './types';

interface SQLLevelSelectorProps {
  level: SQLLevel;
  currentLevel: number;
  completedLevels: number[];
  showHint: boolean;
  onHintToggle: () => void;
  onGoToLevel: (levelId: number) => void;
  levels: SQLLevel[];
}

export function SQLLevelSelector({
  level,
  currentLevel,
  completedLevels,
  showHint,
  onHintToggle,
  onGoToLevel,
  levels,
}: SQLLevelSelectorProps) {
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
                  ? 'bg-warning/10 text-warning'
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
        <div className="p-6 border-b border-border bg-warning/10">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-foreground">
              {level.title}
            </h2>
            <p className="mt-2 text-foreground">
              {level.description}
            </p>
          </div>
        </div>

        {/* Hint Button */}
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
        </div>

        {/* Hint Section */}
        {showHint && (
          <div className="p-6 bg-warning/10 border-l-4 border-l-warning">
            <p className="text-sm text-warning">
              <Lightbulb className="w-4 h-4 inline mr-1" /> <strong>Hint:</strong> {level.hint}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
