'use client';

import { getBasicComponents, getAdvancedComponents } from '@/lib/cv/components';
import { useDraggable } from '@dnd-kit/core';
import * as LucideIcons from 'lucide-react';
import { Plus } from 'lucide-react';

interface ComponentPaletteProps {
  onAddComponent: (type: string) => void;
}

function DraggableComponent({ 
  type, 
  name, 
  icon, 
  description,
  onAdd 
}: { 
  type: string;
  name: string;
  icon: string;
  description: string;
  onAdd: () => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${type}`,
    data: { type, source: 'palette' },
  });

  // Get icon component dynamically
  const IconComponent = (LucideIcons as any)[icon] || LucideIcons.FileText;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`
        group relative p-3 rounded-lg border border-gray-200 dark:border-gray-700
        bg-white dark:bg-gray-800 hover:border-blue-400 dark:hover:border-blue-600
        transition-all cursor-grab active:cursor-grabbing
        ${isDragging ? 'opacity-50 scale-95' : 'hover:shadow-md'}
      `}
    >
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
          <IconComponent className="w-4 h-4" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white">
            {name}
          </h4>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {description}
          </p>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onAdd();
          }}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400"
          title="Add to CV"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export function ComponentPalette({ onAddComponent }: ComponentPaletteProps) {
  const basicComponents = getBasicComponents();
  const advancedComponents = getAdvancedComponents();

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
      {/* Header */}
      <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-800">
        <h3 className="font-semibold text-gray-900 dark:text-white">
          Components
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          Drag to add or click +
        </p>
      </div>

      {/* Scrollable Component List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Basic Components */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Basic
          </h4>
          <div className="space-y-2">
            {basicComponents.map((component) => (
              <DraggableComponent
                key={component.type}
                type={component.type}
                name={component.name}
                icon={component.icon}
                description={component.description}
                onAdd={() => onAddComponent(component.type)}
              />
            ))}
          </div>
        </div>

        {/* Advanced Components */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Advanced
          </h4>
          <div className="space-y-2">
            {advancedComponents.map((component) => (
              <DraggableComponent
                key={component.type}
                type={component.type}
                name={component.name}
                icon={component.icon}
                description={component.description}
                onAdd={() => onAddComponent(component.type)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
