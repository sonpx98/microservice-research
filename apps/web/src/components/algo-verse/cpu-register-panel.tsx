'use client';

import { CPURegisters } from '@/lib/algo-verse/types';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface CPURegisterPanelProps {
  registers: CPURegisters;
}

interface RegisterChange {
  [key: string]: boolean;
}

export function CPURegisterPanel({ registers }: CPURegisterPanelProps) {
  const [changedRegisters, setChangedRegisters] = useState<RegisterChange>({});
  const [prevRegisters, setPrevRegisters] = useState<CPURegisters>(registers);

  // Track which registers changed
  useEffect(() => {
    const changes: RegisterChange = {};
    (Object.keys(registers) as Array<keyof CPURegisters>).forEach((key) => {
      if (registers[key] !== prevRegisters[key]) {
        changes[key] = true;
      }
    });
    
    if (Object.keys(changes).length > 0) {
      setChangedRegisters(changes);
      setPrevRegisters(registers);
      
      // Clear highlights after animation
      setTimeout(() => {
        setChangedRegisters({});
      }, 1000);
    }
  }, [registers, prevRegisters]);

  const toHex = (num: number): string => {
    return '0x' + num.toString(16).toUpperCase().padStart(4, '0');
  };

  const renderRegister = (
    name: string,
    value: number | string,
    colorClass: string,
    isSpecial: boolean = false
  ) => {
    const isChanged = changedRegisters[name.toLowerCase()];
    const numValue = typeof value === 'number' ? value : 0;

    return (
      <motion.div
        key={name}
        className={`flex items-center justify-between p-2 rounded transition-colors duration-300 ${
          isSpecial ? 'border-l-2' : ''
        } ${isChanged ? 'bg-primary/20' : colorClass}`}
      >
        <span className="font-mono font-bold text-xs text-foreground w-8">
          {name}
        </span>
        
        {isSpecial && typeof value === 'string' ? (
          // Instruction Register - show full instruction
          <div className="flex-1 ml-2">
            <code className="text-xs text-foreground font-mono">
              {value || 'NOP'}
            </code>
          </div>
        ) : (
          // Numeric registers - show hex and decimal
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-muted-foreground w-16 text-right">
              {toHex(numValue)}
            </span>
            <span className="font-mono text-xs text-foreground w-12 text-right">
              {numValue}
            </span>
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-border bg-muted">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary"></span>
          CPU Registers
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          Cycle: {registers.pc}
        </p>
      </div>

      {/* Registers */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {/* Special Registers */}
        <div className="space-y-2">
          <div className="text-xs font-medium text-muted-foreground mb-2">
            Special Registers
          </div>
          
          {renderRegister('PC', registers.pc, 'border-primary', true)}
          {renderRegister('IR', registers.ir, 'border-success', true)}
          {renderRegister('ACC', registers.acc, 'border-warning', true)}
        </div>

        {/* General Purpose Registers */}
        <div className="space-y-2">
          <div className="text-xs font-medium text-muted-foreground mb-2 pt-2 border-t border-border">
            General Purpose
          </div>
          
          {renderRegister('R0', registers.r0, '')}
          {renderRegister('R1', registers.r1, '')}
          {renderRegister('R2', registers.r2, '')}
          {renderRegister('R3', registers.r3, '')}
        </div>

        {/* Legend */}
        <div className="pt-3 border-t border-border">
          <div className="text-xs text-muted-foreground space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 border-l-2 border-primary"></div>
              <span>PC: Program Counter</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 border-l-2 border-success"></div>
              <span>IR: Instruction Register</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 border-l-2 border-warning"></div>
              <span>ACC: Accumulator</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
