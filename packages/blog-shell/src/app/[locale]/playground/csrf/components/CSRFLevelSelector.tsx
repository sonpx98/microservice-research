'use client';

import { Code, Lightbulb } from 'lucide-react';
import { CSRFLevel, CSRFLevelExplanation } from './types';

interface CSRFLevelSelectorProps {
  level: CSRFLevel;
  currentLevel: number;
  completedLevels: number[];
  showHint: boolean;
  showSolution: boolean;
  onHintToggle: () => void;
  onSolutionToggle: () => void;
  onGoToLevel: (levelId: number) => void;
  csrfLevelExplanations: Record<number, CSRFLevelExplanation>;
  csrfSolutions: Record<number, string>;
  levels: CSRFLevel[];
}

export function CSRFLevelSelector({
  level,
  currentLevel,
  completedLevels,
  showHint,
  showSolution,
  onHintToggle,
  onSolutionToggle,
  onGoToLevel,
  csrfLevelExplanations,
  csrfSolutions,
  levels,
}: CSRFLevelSelectorProps) {
  return (
    <div className="space-y-6">
      {/* Level Progress */}
      <div className="rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
          Progress ({completedLevels.length}/{levels.length})
        </h3>
        <div className="grid grid-cols-5 gap-2">
          {levels.map((lvl) => (
            <button
              key={lvl.id}
              onClick={() => onGoToLevel(lvl.id)}
              className={`p-3 rounded-lg text-center font-medium text-sm transition-all cursor-pointer hover:opacity-80 ${
                completedLevels.includes(lvl.id)
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                  : currentLevel === lvl.id
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {lvl.id}
            </button>
          ))}
        </div>
      </div>

      {/* Current Level Info */}
      <div className="rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-purple-50/50 to-pink-50/50 dark:from-purple-900/10 dark:to-pink-900/10">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {level.title}
            </h2>
            <p className="mt-2 text-gray-700 dark:text-gray-300">
              {level.description}
            </p>
            <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium">Scenario:</span> {level.scenario}
            </p>
          </div>
        </div>

        {/* Hint and Solution Buttons */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex gap-2 flex-wrap">
          <button
            onClick={onHintToggle}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              showHint 
                ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <Lightbulb className="w-4 h-4" />
            Hint
          </button>
          <button
            onClick={onSolutionToggle}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              showSolution 
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <Code className="w-4 h-4" />
            Solution
          </button>
        </div>

        {/* Hint Section */}
        {showHint && (
          <div className="p-6 border-b border-gray-200 dark:border-gray-800 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-l-yellow-400">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              💡 <strong>Hint:</strong> {level.hint}
            </p>
          </div>
        )}

        {/* Solution Section */}
        {showSolution && (
          <div className="p-6 bg-blue-50 dark:bg-blue-900/20">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-3">
              📝 Solution for Level {currentLevel}
            </p>
            <pre className="bg-gray-900 dark:bg-black text-green-400 p-4 rounded border border-blue-300 dark:border-blue-700 text-xs overflow-x-auto font-mono">
              {csrfSolutions[currentLevel]}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
