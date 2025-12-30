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
        animate={{
          backgroundColor: isChanged 
            ? 'rgb(59, 130, 246)' // blue-500
            : 'transparent',
        }}
        transition={{ duration: 0.3 }}
        className={`flex items-center justify-between p-2 rounded ${
          isSpecial ? 'border-l-2' : ''
        } ${colorClass}`}
      >
        <span className="font-mono font-bold text-xs text-gray-700 dark:text-gray-300 w-8">
          {name}
        </span>
        
        {isSpecial && typeof value === 'string' ? (
          // Instruction Register - show full instruction
          <div className="flex-1 ml-2">
            <code className="text-xs text-gray-900 dark:text-white font-mono">
              {value || 'NOP'}
            </code>
          </div>
        ) : (
          // Numeric registers - show hex and decimal
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-gray-600 dark:text-gray-400 w-16 text-right">
              {toHex(numValue)}
            </span>
            <span className="font-mono text-xs text-gray-900 dark:text-white w-12 text-right">
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
      <div className="flex-shrink-0 px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-purple-500"></span>
          CPU Registers
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Cycle: {registers.pc}
        </p>
      </div>

      {/* Registers */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {/* Special Registers */}
        <div className="space-y-2">
          <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
            Special Registers
          </div>
          
          {renderRegister('PC', registers.pc, 'border-blue-500', true)}
          {renderRegister('IR', registers.ir, 'border-green-500', true)}
          {renderRegister('ACC', registers.acc, 'border-yellow-500', true)}
        </div>

        {/* General Purpose Registers */}
        <div className="space-y-2">
          <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            General Purpose
          </div>
          
          {renderRegister('R0', registers.r0, '')}
          {renderRegister('R1', registers.r1, '')}
          {renderRegister('R2', registers.r2, '')}
          {renderRegister('R3', registers.r3, '')}
        </div>

        {/* Legend */}
        <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 border-l-2 border-blue-500"></div>
              <span>PC: Program Counter</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 border-l-2 border-green-500"></div>
              <span>IR: Instruction Register</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 border-l-2 border-yellow-500"></div>
              <span>ACC: Accumulator</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
