'use client';

import { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Code, FileJson } from 'lucide-react';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  format: 'markdown' | 'json';
}

export function CodeEditor({ value, onChange, format }: CodeEditorProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={`flex flex-col overflow-hidden border-t border-gray-200 dark:border-gray-800 bg-gray-900 transition-all ${isCollapsed ? 'h-12 flex-shrink-0' : 'flex-1'}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800">
        <div className="flex items-center gap-2 text-sm text-gray-300">
          {format === 'markdown' ? (
            <Code className="w-4 h-4" />
          ) : (
            <FileJson className="w-4 h-4" />
          )}
          <span className="font-medium">
            {format === 'markdown' ? 'Markdown Code' : 'JSON Code'}
          </span>
        </div>
        
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-xs text-gray-400 hover:text-gray-200 transition-colors"
        >
          {isCollapsed ? 'Expand' : 'Collapse'}
        </button>
      </div>

      {/* Editor */}
      {!isCollapsed && (
        <div className="h-[calc(100%-41px)]">
          <Editor
            height="100%"
            language={format}
            value={value}
            onChange={(value) => onChange(value || '')}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 13,
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              automaticLayout: true,
              tabSize: 2,
              insertSpaces: true,
            }}
          />
        </div>
      )}
    </div>
  );
}
