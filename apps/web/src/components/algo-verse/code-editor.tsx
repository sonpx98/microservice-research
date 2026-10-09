'use client';

import { useState, useEffect } from 'react';
import { CodeExample } from '@/lib/algo-verse/types';
import { motion } from 'framer-motion';
import { Code2, ChevronDown } from 'lucide-react';

interface CodeEditorProps {
  code: string;
  currentLine: number;
  examples: CodeExample[];
  onCodeChange: (code: string) => void;
  onExampleSelect: (example: CodeExample) => void;
  disabled?: boolean;
}

export function CodeEditor({
  code,
  currentLine,
  examples,
  onCodeChange,
  onExampleSelect,
  disabled = false,
}: CodeEditorProps) {
  const [showExamples, setShowExamples] = useState(false);
  const lines = code.split('\n');

  return (
    <div className="h-full flex flex-col rounded-xl border border-border bg-card">
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-border bg-muted flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-foreground">
            Code Editor
          </h3>
        </div>

        {/* Example Selector */}
        <div className="relative">
          <button
            onClick={() => setShowExamples(!showExamples)}
            disabled={disabled}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-foreground bg-card border border-input rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Examples
            <ChevronDown className={`w-3 h-3 transition-transform ${showExamples ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown */}
          {showExamples && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute right-0 top-full mt-2 w-64 bg-card border border-border rounded-lg shadow-lg z-10 overflow-hidden"
            >
              <div className="max-h-96 overflow-y-auto">
                {examples.map((example) => (
                  <button
                    key={example.id}
                    onClick={() => {
                      onExampleSelect(example);
                      setShowExamples(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-muted border-b border-border last:border-b-0 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-foreground">
                        {example.title}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        example.difficulty === 'beginner' 
                          ? 'bg-success/10 text-success'
                          : example.difficulty === 'intermediate'
                          ? 'bg-warning/10 text-warning'
                          : 'bg-danger/10 text-danger'
                      }`}>
                        {example.difficulty}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {example.description}
                    </p>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Code Display with Line Numbers */}
      <div className="flex-1 overflow-auto">
        <div className="flex">
          {/* Line Numbers */}
          <div className="flex-shrink-0 px-3 py-4 bg-muted border-r border-border select-none">
            {lines.map((_, index) => {
              const lineNum = index + 1;
              const isCurrentLine = lineNum === currentLine;
              
              return (
                <div
                  key={index}
                  className={`text-xs font-mono text-right leading-6 ${
                    isCurrentLine
                      ? 'text-primary font-bold'
                      : 'text-muted-foreground'
                  }`}
                >
                  {lineNum}
                </div>
              );
            })}
          </div>

          {/* Code Content */}
          <div className="flex-1 relative">
            <textarea
              value={code}
              onChange={(e) => onCodeChange(e.target.value)}
              disabled={disabled}
              spellCheck={false}
              className="w-full h-full px-4 py-4 bg-transparent text-sm font-mono text-foreground leading-6 resize-none focus:outline-none disabled:cursor-not-allowed"
              style={{
                tabSize: 2,
                minHeight: '400px',
              }}
            />

            {/* Current Line Highlight */}
            {currentLine > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute left-0 right-0 bg-primary/10 pointer-events-none"
                style={{
                  top: `${(currentLine - 1) * 24 + 16}px`,
                  height: '24px',
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex-shrink-0 px-4 py-2 border-t border-border bg-muted">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{lines.length} lines</span>
          {currentLine > 0 && (
            <span>
              Executing line <span className="font-semibold text-primary">{currentLine}</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
