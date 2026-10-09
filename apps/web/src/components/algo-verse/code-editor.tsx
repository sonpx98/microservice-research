'use client';

import { CodeExample } from '@/lib/algo-verse/types';
import { motion } from 'framer-motion';
import { Code2, ChevronDown } from 'lucide-react';
import { Panel } from '@/components/layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';

interface CodeEditorProps {
  code: string;
  currentLine: number;
  examples: CodeExample[];
  onCodeChange: (code: string) => void;
  onExampleSelect: (example: CodeExample) => void;
  disabled?: boolean;
}

const DIFFICULTY_TONE: Record<string, string> = {
  beginner: 'bg-success/10 text-success',
  intermediate: 'bg-warning/10 text-warning',
  advanced: 'bg-danger/10 text-danger',
};

export function CodeEditor({
  code,
  currentLine,
  examples,
  onCodeChange,
  onExampleSelect,
  disabled = false,
}: CodeEditorProps) {
  const lines = code.split('\n');

  return (
    <Panel
      className="flex h-full flex-col"
      bodyClassName="flex min-h-0 flex-1 flex-col"
      padding="none"
      title={
        <span className="flex items-center gap-2">
          <Code2 className="h-4 w-4 text-muted-foreground" />
          Code editor
        </span>
      }
      actions={
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" disabled={disabled}>
              Examples
              <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
            {examples.map((example) => (
              <DropdownMenuItem
                key={example.id}
                onSelect={() => onExampleSelect(example)}
                className="flex flex-col items-start gap-1"
              >
                <span className="flex w-full items-center justify-between gap-2">
                  <span className="font-medium">{example.title}</span>
                  <Badge variant="secondary" className={DIFFICULTY_TONE[example.difficulty] ?? ''}>
                    {example.difficulty}
                  </Badge>
                </span>
                <span className="text-xs text-muted-foreground">{example.description}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      }
    >
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
            {/* Borderless: the text must line up with the line-number gutter. */}
            <Textarea
              value={code}
              onChange={(e) => onCodeChange(e.target.value)}
              disabled={disabled}
              spellCheck={false}
              className="h-full min-h-[400px] resize-none rounded-none border-0 bg-transparent p-4 font-mono text-sm leading-6 shadow-none focus-visible:ring-0 md:text-sm dark:bg-transparent"
              style={{ tabSize: 2 }}
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
    </Panel>
  );
}
