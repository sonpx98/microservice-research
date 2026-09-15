'use client';

import { useState, useRef, useEffect } from 'react';
import { Save, Download, FileJson, Plus, Layout, ChevronDown, MoreVertical } from 'lucide-react';
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
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowTemplates(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setShowMobileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectTemplate = (template: CVTemplate) => {
    onSelectTemplate(template);
    setShowTemplates(false);
    setShowMobileMenu(false);
  };

  return (
    <div className="h-14 flex-shrink-0 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <h1 className="text-lg font-bold text-gray-900 dark:text-white">
        CV Generator
      </h1>

      {/* Desktop Toolbar */}
      <div className="hidden md:flex items-center gap-2">
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

      {/* Mobile Toolbar */}
      <div className="flex md:hidden items-center gap-2">
        <button
          onClick={onSave}
          disabled={isSaving}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-lg transition-colors"
        >
          <Save className="w-4 h-4" />
          {isSaving ? '...' : 'Save'}
        </button>

        {/* Mobile Menu */}
        <div className="relative" ref={mobileMenuRef}>
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <MoreVertical className="w-5 h-5" />
          </button>

          {showMobileMenu && (
            <div className="absolute right-0 top-full mt-1 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
              {/* New CV */}
              <button
                onClick={() => { onNew(); setShowMobileMenu(false); }}
                className="w-full text-left px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-3"
              >
                <Plus className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-900 dark:text-white">New CV</span>
              </button>

              {/* Divider */}
              <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
              
              {/* Templates Section */}
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Templates</div>
              {cvTemplates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleSelectTemplate(template)}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-3"
                >
                  <span>{template.icon}</span>
                  <span className="text-sm text-gray-900 dark:text-white">{template.name}</span>
                </button>
              ))}

              {/* Divider */}
              <div className="border-t border-gray-200 dark:border-gray-700 my-1" />

              {/* Export Options */}
              <button
                onClick={() => { onExportPDF(); setShowMobileMenu(false); }}
                className="w-full text-left px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-3"
              >
                <Download className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-900 dark:text-white">Export PDF</span>
              </button>
              
              <button
                onClick={() => { onExportJSON(); setShowMobileMenu(false); }}
                className="w-full text-left px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-3"
              >
                <FileJson className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-900 dark:text-white">Export JSON</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
