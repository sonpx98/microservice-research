'use client';

import { useState, useEffect, useRef, useId } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { DndContext, DragEndEvent, DragOverEvent, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { CVData, CVComponent } from '@/lib/cv/types';
import { createEmptyCV, createComponent, reorderSections, updateSection, removeSection, addSection } from '@/lib/cv/utils';
import { getComponentDefinition } from '@/lib/cv/components';
import { codeGenerator } from './lib/code-generator';
import { cvStorage } from './lib/storage';
import { PDFExporter } from './lib/pdf-export';
import { PDFPageCalculator } from './lib/pdf-calculator';
import type { CVTemplate } from './lib/templates';

import { Toolbar } from './components/toolbar';
import { ComponentPalette } from './components/component-palette';
import { VisualBuilder } from './components/visual-builder';
import { PreviewPanel } from './components/preview-panel';
import { CodeEditor } from './components/code-editor';
import { PDFPreviewModal } from './components/pdf-preview-modal';
import { useMediaQuery } from '@/hooks/use-media-query';
import { SegmentTabs, SegmentTabsList, SegmentTabsTrigger, SegmentTabsContent } from '@/components/ui/segment-tabs';

export default function CVGeneratorPage() {
  const [cv, setCV] = useState<CVData>(() => createEmptyCV());
  const [markdown, setMarkdown] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const isParsingMarkdown = useRef(false);
  
  // Generate stable ID for DndContext to prevent hydration mismatch
  const dndId = useId();
  
  // PDF Preview Modal state
  const [showPDFPreview, setShowPDFPreview] = useState(false);
  const [pdfPreviewUrl, setPDFPreviewUrl] = useState(''); // HTML string for iframe srcDoc
  const [pdfAnalysis, setPDFAnalysis] = useState<any>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
      },
    })
  );

  // Generate markdown whenever CV changes (but not when parsing markdown)
  useEffect(() => {
    if (isParsingMarkdown.current) {
      isParsingMarkdown.current = false;
      return;
    }
    const generated = codeGenerator.generateMarkdown(cv);
    setMarkdown(generated);
  }, [cv]);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = cvStorage.getAll();
    if (saved.length > 0) {
      // Load most recent
      const latest = saved.sort((a, b) => 
        new Date(b.metadata.updatedAt).getTime() - new Date(a.metadata.updatedAt).getTime()
      )[0];
      setCV(latest);
    }
  }, []);

  // Cleanup: revoke blob URL when component unmounts or modal closes
  useEffect(() => {
    return () => {
      if (pdfPreviewUrl) {
        try {
          URL.revokeObjectURL(pdfPreviewUrl);
        } catch (e) {
          // Already revoked
        }
      }
    };
  }, [pdfPreviewUrl]);

  const handleAddComponent = (type: string) => {
    const definition = getComponentDefinition(type);
    if (!definition) return;

    const newComponent = createComponent(
      type as any,
      cv.sections.length,
      definition.defaultData
    );

    setCV(addSection(cv, newComponent));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;

    // Check if dragging from palette
    if (active.data.current?.source === 'palette') {
      const type = active.data.current.type;
      handleAddComponent(type);
      return;
    }

    // Reordering existing sections
    if (active.id !== over.id) {
      const oldIndex = cv.sections.findIndex(s => s.id === active.id);
      const newIndex = cv.sections.findIndex(s => s.id === over.id);
      
      const newSections = reorderSections(cv.sections, oldIndex, newIndex);
      setCV({ ...cv, sections: newSections });
    }
  };

  const handleDeleteSection = (id: string) => {
    setCV(removeSection(cv, id));
  };

  const handleToggleVisibility = (id: string) => {
    const section = cv.sections.find(s => s.id === id);
    if (section) {
      const updated = updateSection(cv, id, section.data);
      setCV({
        ...updated,
        sections: updated.sections.map(s =>
          s.id === id ? { ...s, visible: !s.visible } : s
        ),
      });
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      cvStorage.save(cv);
      // Show success notification (you can add a toast here)
      setTimeout(() => setIsSaving(false), 500);
    } catch (error) {
      console.error('Failed to save:', error);
      setIsSaving(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      setIsGeneratingPDF(true);
      
      // Analyze page layout
      const analysis = PDFPageCalculator.analyzePageLayout(markdown);
      
      // Generate preview HTML with multi-page layout
      const filename = cvStorage.extractCVName(cv);
      const htmlDoc = PDFExporter.generatePreviewDocument(markdown, filename);
      
      // Store HTML as data for iframe srcDoc (not blob URL)
      setPDFAnalysis(analysis);
      setPDFPreviewUrl(htmlDoc);
      setShowPDFPreview(true);
    } catch (error) {
      console.error('Failed to prepare PDF export:', error);
      alert('Failed to prepare PDF export');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleConfirmPDFExport = () => {
    try {
      setShowPDFPreview(false);
      setPDFPreviewUrl('');
      
      const filename = cvStorage.extractCVName(cv);
      PDFExporter.exportPDF(markdown, filename);
    } catch (error) {
      console.error('Failed to export PDF:', error);
      alert('Failed to export CV as PDF');
    }
  };

  const handleCancelPDFExport = () => {
    setPDFPreviewUrl('');
    setShowPDFPreview(false);
  };

  const handleExportJSON = () => {
    try {
      cvStorage.exportJSON(cv.metadata.id);
    } catch (error) {
      console.error('Failed to export JSON:', error);
      alert('Failed to export CV as JSON');
    }
  };

  const handleNew = () => {
    if (confirm('Create a new CV? Unsaved changes will be lost.')) {
      setCV(createEmptyCV());
      setMarkdown('');
    }
  };

  const handleSelectTemplate = (template: CVTemplate) => {
    if (confirm(`Load "${template.name}" template? This will replace current content.`)) {
      setMarkdown(template.markdown);
      // Parse the template markdown into CV structure
      isParsingMarkdown.current = true;
      const parsedCV = codeGenerator.parseMarkdown(template.markdown, createEmptyCV());
      setCV(parsedCV);
    }
  };

  const handleMarkdownChange = useDebouncedCallback((value: string) => {
    setMarkdown(value);
    
    // Parse markdown back to CV data
    try {
      isParsingMarkdown.current = true;
      const parsedCV = codeGenerator.parseMarkdown(value, cv);
      setCV(parsedCV);
    } catch (error) {
      console.error('Failed to parse markdown:', error);
      isParsingMarkdown.current = false;
    }
  }, 500);

  // Responsive check - desktop >= 1024px
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  // Handle move section for mobile (up/down buttons instead of DnD)
  const handleMoveSection = (id: string, direction: 'up' | 'down') => {
    const sortedSections = [...cv.sections].sort((a, b) => a.order - b.order);
    const idx = sortedSections.findIndex(s => s.id === id);
    
    if (direction === 'up' && idx > 0) {
      [sortedSections[idx], sortedSections[idx - 1]] = [sortedSections[idx - 1], sortedSections[idx]];
    } else if (direction === 'down' && idx < sortedSections.length - 1) {
      [sortedSections[idx], sortedSections[idx + 1]] = [sortedSections[idx + 1], sortedSections[idx]];
    }
    
    // Re-assign order values
    const reordered = sortedSections.map((s, i) => ({ ...s, order: i }));
    setCV({ ...cv, sections: reordered });
  };

  // Show loading skeleton during SSR/hydration
  if (isDesktop === null) {
    return (
      <div className="flex flex-col bg-gray-50 dark:bg-gray-950 h-full overflow-hidden">
        <div className="container mx-auto max-w-7xl">
          <div className="h-14 flex-shrink-0 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
            <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-gray-400">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-gray-50 dark:bg-gray-950 h-full overflow-hidden">
      {/* Toolbar with Container */}
      <div className="container mx-auto max-w-7xl">
        <Toolbar
          onSave={handleSave}
          onExportPDF={handleExportPDF}
          onExportJSON={handleExportJSON}
          onNew={handleNew}
          onSelectTemplate={handleSelectTemplate}
          isSaving={isSaving}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex gap-0 overflow-hidden container mx-auto max-w-7xl">
        {isDesktop ? (
          // Desktop: 3-Column Layout with DnD
          <DndContext id={dndId} sensors={sensors} onDragEnd={handleDragEnd}>
            {/* Left Panel - Component Palette */}
            <div className="w-64 flex-shrink-0 overflow-y-auto border-r border-gray-200 dark:border-gray-800">
              <ComponentPalette onAddComponent={handleAddComponent} />
            </div>

            {/* Middle Panel - 60/40 Visual Builder & Code Editor */}
            <div className="flex-1 flex flex-col min-w-0">
              {/* Visual Builder - Top 60% */}
              <div className="flex-1 overflow-y-auto border-b border-gray-200 dark:border-gray-800 min-h-0">
                <SortableContext
                  items={cv.sections.map(s => s.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <VisualBuilder
                    sections={cv.sections}
                    onReorder={(sections) => setCV({ ...cv, sections })}
                    onEdit={setEditingSection}
                    onDelete={handleDeleteSection}
                    onToggleVisibility={handleToggleVisibility}
                  />
                </SortableContext>
              </div>

              {/* Code Editor - Bottom 40% */}
              <CodeEditor
                value={markdown}
                onChange={handleMarkdownChange}
                format="markdown"
              />
            </div>

            {/* Right Panel - Preview */}
            <div className="w-96 flex-shrink-0 overflow-y-auto border-l border-gray-200 dark:border-gray-800">
              <PreviewPanel cv={cv} />
            </div>
          </DndContext>
        ) : (
          // Mobile/Tablet: Tab Layout WITH DnD
          <DndContext id={dndId} sensors={sensors} onDragEnd={handleDragEnd}>
            <div className="w-full h-full flex flex-col min-h-0">
              <SegmentTabs defaultValue="design" className="flex-1 flex flex-col min-h-0">
                {/* Mobile Tabs - Reusable SegmentTabs Component */}
                <div className="px-3 py-2 bg-gray-50 dark:bg-gray-900/50 flex-shrink-0">
                  <SegmentTabsList className="grid grid-cols-3">
                    <SegmentTabsTrigger 
                      value="design" 
                      icon={
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                        </svg>
                      }
                    >
                      Design
                    </SegmentTabsTrigger>
                    <SegmentTabsTrigger 
                      value="code"
                      icon={
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                        </svg>
                      }
                    >
                      Code
                    </SegmentTabsTrigger>
                    <SegmentTabsTrigger 
                      value="preview"
                      icon={
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      }
                    >
                      Preview
                    </SegmentTabsTrigger>
                  </SegmentTabsList>
                </div>

                <div className="flex-1 overflow-hidden min-h-0">
                  {/* Design Tab */}
                  <SegmentTabsContent value="design" className="h-full m-0 p-0 overflow-y-auto">
                    <div className="p-4 space-y-4">
                      {/* Component Palette - NO drag, just tap to add */}
                      <ComponentPalette onAddComponent={handleAddComponent} isMobile />
                      
                      {/* CV Sections with DnD handles */}
                      <h3 className="font-semibold text-sm text-gray-500 uppercase tracking-wider pb-3">
                        Your CV Sections
                      </h3>
                      <SortableContext
                        items={cv.sections.map(s => s.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        <VisualBuilder
                          sections={cv.sections}
                          onReorder={(sections) => setCV({ ...cv, sections })}
                          onEdit={setEditingSection}
                          onDelete={handleDeleteSection}
                          onToggleVisibility={handleToggleVisibility}
                          onMoveSection={handleMoveSection}
                          isMobile
                        />
                      </SortableContext>
                    </div>
                  </SegmentTabsContent>

                  {/* Code Tab */}
                  <SegmentTabsContent value="code" className="h-full m-0 p-0 flex flex-col">
                    <CodeEditor
                      value={markdown}
                      onChange={handleMarkdownChange}
                      format="markdown"
                    />
                  </SegmentTabsContent>

                  {/* Preview Tab */}
                  <SegmentTabsContent value="preview" className="h-full m-0 p-0 overflow-y-auto">
                    <PreviewPanel cv={cv} />
                  </SegmentTabsContent>
                </div>
              </SegmentTabs>
            </div>
          </DndContext>
        )}
      </div>

      {/* PDF Preview Modal */}
      <PDFPreviewModal
        isOpen={showPDFPreview}
        pdfUrl={pdfPreviewUrl}
        analysis={pdfAnalysis}
        filename={cvStorage.extractCVName(cv)}
        isLoading={isGeneratingPDF}
        onConfirm={handleConfirmPDFExport}
        onCancel={handleCancelPDFExport}
      />
    </div>
  );
}
