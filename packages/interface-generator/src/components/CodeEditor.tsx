import { useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';

interface CodeEditorProps {
  value: string;
  onChange: (value: string | undefined) => void;
  language: string;
  placeholder?: string;
  readOnly?: boolean;
  height?: string;
  theme?: string;
}

export function CodeEditor({ 
  value, 
  onChange, 
  language,
  placeholder, 
  readOnly = false,
  height = "400px",
  theme = "vs-dark"
}: CodeEditorProps) {
  const editorRef = useRef<any>(null);

  useEffect(() => {
    if (editorRef.current && placeholder && !value) {
      // Add placeholder text when editor is empty
      const editor = editorRef.current;
      const model = editor.getModel();
      if (model && model.getValue() === '') {
        // This is a simple approach - you could make it more sophisticated
        editor.setValue(`// ${placeholder}`);
        editor.setSelection({ startLineNumber: 1, startColumn: 4, endLineNumber: 1, endColumn: placeholder.length + 4 });
      }
    }
  }, [placeholder, value]);

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
    
    // Configure JSON validation for JSON language
    if (language === 'json') {
      const monaco = (window as any).monaco;
      if (monaco) {
        monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
          validate: true,
          allowComments: false,
          schemas: [],
          enableSchemaRequest: false,
        });
      }
    }
  };

  return (
    <div className="interfacegen:border interfacegen:rounded-md interfacegen:overflow-hidden">
      <Editor
        height={height}
        language={language}
        value={value}
        onChange={onChange}
        theme={theme}
        onMount={handleEditorDidMount}
        options={{
          readOnly,
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          roundedSelection: false,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          wordWrap: 'on',
          suggestOnTriggerCharacters: true,
          acceptSuggestionOnEnter: 'on',
          tabCompletion: 'on',
          quickSuggestions: true,
          parameterHints: { enabled: true },
          formatOnPaste: true,
          formatOnType: true,
          contextmenu: true,
          selectOnLineNumbers: true,
          glyphMargin: false,
          folding: true,
          foldingStrategy: 'indentation',
          showFoldingControls: 'always',
          disableLayerHinting: true,
          fontLigatures: false,
          hideCursorInOverviewRuler: true,
          renderLineHighlight: 'all',
          smoothScrolling: true,
          cursorBlinking: 'blink',
          cursorStyle: 'line',
          renderWhitespace: 'selection',
          bracketPairColorization: { enabled: true },
          autoIndent: 'advanced',
          autoClosingBrackets: 'always',
          autoClosingQuotes: 'always',
          autoSurround: 'languageDefined',
        }}
        loading={
          <div className="interfacegen:flex interfacegen:items-center interfacegen:justify-center interfacegen:h-full interfacegen:bg-gray-900 interfacegen:text-white">
            <div className="interfacegen:text-sm">Loading Monaco Editor...</div>
          </div>
        }
      />
    </div>
  );
}