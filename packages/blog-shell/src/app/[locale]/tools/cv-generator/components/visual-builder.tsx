'use client';

import { useDroppable } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { CVComponent } from '@/lib/cv/types';
import { Trash2, GripVertical, Eye, EyeOff, ChevronUp, ChevronDown } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { getComponentDefinition } from '@/lib/cv/components';

interface SortableSectionProps {
  section: CVComponent;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleVisibility: (id: string) => void;
}

function SortableSection({ section, onEdit, onDelete, onToggleVisibility }: SortableSectionProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const definition = getComponentDefinition(section.type);
  const IconComponent = definition 
    ? (LucideIcons as any)[definition.icon] || LucideIcons.FileText
    : LucideIcons.FileText;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        group p-4 rounded-lg border border-gray-200 dark:border-gray-700
        bg-white dark:bg-gray-800 hover:border-blue-400 dark:hover:border-blue-600
        transition-all
        ${isDragging ? 'opacity-50 shadow-lg' : ''}
        ${!section.visible ? 'opacity-60' : ''}
      `}
    >
      <div className="flex items-center gap-3">
        {/* Drag Handle */}
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 touch-none"
        >
          <GripVertical className="w-5 h-5" />
        </button>

        {/* Icon */}
        <div className="p-2 rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
          <IconComponent className="w-4 h-4" />
        </div>

        {/* Content */}
        <div 
          className="flex-1 cursor-pointer"
          onClick={() => onEdit(section.id)}
        >
          <h4 className="text-sm font-medium text-gray-900 dark:text-white">
            {definition?.name || section.type}
          </h4>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Click to edit
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onToggleVisibility(section.id)}
            className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
            title={section.visible ? 'Hide' : 'Show'}
          >
            {section.visible ? (
              <Eye className="w-4 h-4" />
            ) : (
              <EyeOff className="w-4 h-4" />
            )}
          </button>
          
          <button
            onClick={() => onDelete(section.id)}
            className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

interface VisualBuilderProps {
  sections: CVComponent[];
  onReorder: (sections: CVComponent[]) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  onMoveSection?: (id: string, direction: 'up' | 'down') => void;
  isMobile?: boolean;
}

// Mobile section card (no DnD, uses up/down buttons)
function MobileSection({ 
  section, 
  onEdit, 
  onDelete, 
  onToggleVisibility, 
  onMoveUp, 
  onMoveDown, 
  isFirst, 
  isLast 
}: {
  section: CVComponent;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}) {
  const definition = getComponentDefinition(section.type);
  const IconComponent = definition 
    ? (LucideIcons as any)[definition.icon] || LucideIcons.FileText
    : LucideIcons.FileText;

  return (
    <div
      className={`
        p-4 rounded-lg border border-gray-200 dark:border-gray-700
        bg-white dark:bg-gray-800
        ${!section.visible ? 'opacity-60' : ''}
      `}
    >
      <div className="flex items-center gap-3">
        {/* Move Up/Down Buttons */}
        <div className="flex flex-col gap-0.5">
          <button
            onClick={onMoveUp}
            disabled={isFirst}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 disabled:opacity-30 disabled:cursor-not-allowed"
            title="Move Up"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
          <button
            onClick={onMoveDown}
            disabled={isLast}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 disabled:opacity-30 disabled:cursor-not-allowed"
            title="Move Down"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>

        {/* Icon */}
        <div className="p-2 rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
          <IconComponent className="w-4 h-4" />
        </div>

        {/* Content */}
        <div 
          className="flex-1 cursor-pointer"
          onClick={() => onEdit(section.id)}
        >
          <h4 className="text-sm font-medium text-gray-900 dark:text-white">
            {definition?.name || section.type}
          </h4>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Tap to edit
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onToggleVisibility(section.id)}
            className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
            title={section.visible ? 'Hide' : 'Show'}
          >
            {section.visible ? (
              <Eye className="w-4 h-4" />
            ) : (
              <EyeOff className="w-4 h-4" />
            )}
          </button>
          
          <button
            onClick={() => onDelete(section.id)}
            className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function VisualBuilder({
  sections,
  onReorder,
  onEdit,
  onDelete,
  onToggleVisibility,
  onMoveSection,
  isMobile = false,
}: VisualBuilderProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'visual-builder',
  });

  const sortedSections = [...sections].sort((a, b) => a.order - b.order);

  // Always use droppable ref for DnD (works on both mobile and desktop)

  return (
    <div className={`flex flex-col ${isMobile ? '' : 'h-full bg-gray-50 dark:bg-gray-950'}`}>
      {/* Header - only show on desktop */}
      {!isMobile && (
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            CV Builder
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {sections.length} section{sections.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}

      {/* Sections Area */}
      <div
        ref={setNodeRef}
        className={`
          ${isMobile ? 'space-y-3' : 'flex-1 overflow-y-auto p-6 space-y-3'}
          ${isOver ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}
        `}
      >
        {sortedSections.length === 0 ? (
          <div className={`flex items-center justify-center ${isMobile ? 'py-8' : 'h-full'}`}>
            <div className="text-center text-gray-400 dark:text-gray-600">
              <p className="text-sm font-medium">No sections yet</p>
              <p className="text-xs mt-1">
                Drag components here to build your CV
              </p>
            </div>
          </div>
        ) : (
          // Always use SortableSection with DnD (works on both mobile and desktop)
          sortedSections.map((section) => (
            <SortableSection
              key={section.id}
              section={section}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleVisibility={onToggleVisibility}
            />
          ))
        )}
      </div>
    </div>
  );
}
