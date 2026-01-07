'use client';

import { useState, useRef, useEffect } from 'react';
import { Save, Download, FileJson, Plus, Layout, ChevronDown } from 'lucide-react';
import { cvTemplates, type CVTemplate } from '../lib/templates';

interface ToolbarProps {
  onSave: () => void;
  onExportPDF: () => void;
  onExportJSON: () => void;
  onNew: () => void;
  onSelectTemplate: (template: CVTemplate) => void;
  isSaving?: boolean;
}

export function Toolbar({ 
  onSave, 
  onExportPDF, 
  onExportJSON, 
  onNew,
  onSelectTemplate,
  isSaving = false 
}: ToolbarProps) {
  const [showTemplates, setShowTemplates] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowTemplates(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectTemplate = (template: CVTemplate) => {
    onSelectTemplate(template);
    setShowTemplates(false);
  };

  return (
    <div className="h-16 flex-shrink-0 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <h1 className="text-xl font-bold text-gray-900 dark:text-white">
        CV Generator
      </h1>

      <div className="flex items-center gap-2">
        <button
          onClick={onNew}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          New
        </button>

        {/* Template Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowTemplates(!showTemplates)}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <Layout className="w-4 h-4" />
            Templates
            <ChevronDown className={`w-3 h-3 transition-transform ${showTemplates ? 'rotate-180' : ''}`} />
          </button>

          {showTemplates && (
            <div className="absolute right-0 top-full mt-1 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
              {cvTemplates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleSelectTemplate(template)}
                  className="w-full text-left px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{template.icon}</span>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white text-sm">
                        {template.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {template.description}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={onSave}
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-lg transition-colors"
        >
          <Save className="w-4 h-4" />
          {isSaving ? 'Saving...' : 'Save'}
        </button>

        <div className="w-px h-6 bg-gray-200 dark:bg-gray-700" />

        <button
          onClick={onExportPDF}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <Download className="w-4 h-4" />
          Export PDF
        </button>

        <button
          onClick={onExportJSON}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <FileJson className="w-4 h-4" />
          Export JSON
        </button>
      </div>
    </div>
  );
}

