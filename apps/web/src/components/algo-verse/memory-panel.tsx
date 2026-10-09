'use client';

import { useState } from 'react';
import { Panel } from '@/components/layout';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
    <Panel className="flex h-full flex-col" padding="none" bodyClassName="flex min-h-0 flex-1 flex-col">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="border-b border-border p-2">
        <TabsList>
          {tabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} className="gap-1.5 text-xs">
              {tab.label}
              {tab.badge !== undefined && <span className="font-mono text-muted-foreground">{tab.badge}</span>}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden min-h-0">
        {activeTab === 'stack' && <StackVisualizer stack={stack} onHeapReferenceClick={handleHeapReferenceClick} />}
        {activeTab === 'heap' && <HeapVisualizer heap={heap} showAddresses={showAddresses} highlightedAddress={highlightedHeapAddress} />}
        {activeTab === 'cpu' && <CPURegisterPanel registers={registers} />}
        {activeTab === 'assembly' && (
          <AssemblyCodeMapper assemblyCode={assemblyCode} currentSourceLine={currentLine} />
        )}
      </div>
    </Panel>
  );
}
