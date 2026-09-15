'use client';

import { useState } from 'react';
import { StackVisualizer } from './stack-visualizer';
import { HeapVisualizer } from './heap-visualizer';
import { CPURegisterPanel } from './cpu-register-panel';
import { AssemblyCodeMapper } from './assembly-mapper';
import { StackFrame, HeapObject, CPURegisters, AssemblyInstruction } from '@/lib/algo-verse/types';

interface MemoryPanelProps {
  stack: StackFrame[];
  heap: HeapObject[];
  showAddresses?: boolean;
  cpuRegisters?: CPURegisters;
  assemblyCode?: AssemblyInstruction[];
  currentLine?: number;
}

type TabType = 'stack' | 'heap' | 'cpu' | 'assembly';

export function MemoryPanel({ 
  stack, 
  heap, 
  showAddresses = true,
  cpuRegisters,
  assemblyCode = [],
  currentLine = 0
}: MemoryPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>('stack');
  const [highlightedHeapAddress, setHighlightedHeapAddress] = useState<string | null>(null);

  // Handle heap reference click
  const handleHeapReferenceClick = (address: string) => {
    setActiveTab('heap');
    setHighlightedHeapAddress(address);
    // Clear highlight after animation
    setTimeout(() => setHighlightedHeapAddress(null), 2000);
  };

  // Default CPU registers if not provided
  const defaultRegisters: CPURegisters = {
    pc: 0,
    ir: 'NOP',
    acc: 0,
    r0: 0,
    r1: 0,
    r2: 0,
    r3: 0,
  };

  const registers = cpuRegisters || defaultRegisters;

  const tabs: { id: TabType; label: string; badge?: number }[] = [
    { id: 'stack', label: 'Call Stack', badge: stack.length },
    { id: 'heap', label: 'Heap Memory', badge: heap.length },
    { id: 'cpu', label: 'CPU Registers' },
    { id: 'assembly', label: 'Assembly', badge: assemblyCode.length },
  ];

  return (
    <div className="h-full flex flex-col rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
      {/* Tab Headers */}
      <div className="flex-shrink-0 flex items-center gap-1 px-2 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-blue-500 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            {tab.label}
            {tab.badge !== undefined && (
              <span
                className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${
                  activeTab === tab.id
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden min-h-0">
        {activeTab === 'stack' && <StackVisualizer stack={stack} onHeapReferenceClick={handleHeapReferenceClick} />}
        {activeTab === 'heap' && <HeapVisualizer heap={heap} showAddresses={showAddresses} highlightedAddress={highlightedHeapAddress} />}
        {activeTab === 'cpu' && <CPURegisterPanel registers={registers} />}
        {activeTab === 'assembly' && (
          <AssemblyCodeMapper assemblyCode={assemblyCode} currentSourceLine={currentLine} />
        )}
      </div>
    </div>
  );
}
