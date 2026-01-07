'use client';

import { useEffect, useState } from 'react';
import type { CVData, CVComponent } from '@/lib/cv/types';
import { 
  CVHeader, 
  CVSummary, 
  CVExperience, 
  CVSkills, 
  CVEducation, 
  CVProjects, 
  CVCertifications, 
  CVLanguages 
} from '@/components/cv';
import { CVRaw } from '@/components/cv/cv-raw';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';

interface PreviewPanelProps {
  cv: CVData;
  markdown?: string;
}

export function PreviewPanel({ cv, markdown }: PreviewPanelProps) {
  // Note: Orphan content is now handled by parser creating Raw components
  // No need to extract and render orphan markdown separately anymore

  const renderSection = (section: CVComponent) => {
    if (!section.visible) return null;

    const key = section.id;
    
    switch (section.type) {
      case 'header':
        return <CVHeader key={key} data={section.data} />;
      case 'summary':
        return <CVSummary key={key} data={section.data} />;
      case 'experience':
        return <CVExperience key={key} data={section.data} />;
      case 'education':
        return <CVEducation key={key} data={section.data} />;
      case 'skills':
        return <CVSkills key={key} data={section.data} />;
      case 'projects':
        return <CVProjects key={key} data={section.data} />;
      case 'certifications':
        return <CVCertifications key={key} data={section.data} />;
      case 'languages':
        return <CVLanguages key={key} data={section.data} />;
      case 'raw':
        return <CVRaw key={key} data={section.data} />;
      default:
        return null;
    }
  };

  const sortedSections = [...cv.sections].sort((a, b) => a.order - b.order);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <h3 className="font-semibold text-gray-900 dark:text-white">
          Live Preview
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          {cv.metadata.template} template
        </p>
      </div>

      {/* CV Preview - Scrollable */}
      <div className="flex-1 overflow-y-auto bg-white dark:bg-gray-900">
        {/* A4 Paper Simulation */}
        <div className="max-w-[210mm] mx-auto bg-white dark:bg-gray-950 shadow-lg">
          <div className="p-12 space-y-8">
            {sortedSections.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                <p>No sections added yet</p>
                <p className="text-sm mt-2">
                  Type markdown in the editor or drag components from the palette
                </p>
              </div>
            ) : (
              <>
                {/* Render all CV sections (including Raw components) */}
                {sortedSections.map(renderSection)}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

