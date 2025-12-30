'use client';

import { AssemblyInstruction } from '@/lib/algo-verse/types';
import { motion, AnimatePresence } from 'framer-motion';

interface AssemblyCodeMapperProps {
  assemblyCode: AssemblyInstruction[];
  currentSourceLine: number;
}

export function AssemblyCodeMapper({ assemblyCode, currentSourceLine }: AssemblyCodeMapperProps) {
  // Get active assembly instructions for current source line
  const activeInstructions = assemblyCode.filter(
    inst => inst.sourceLineNumber === currentSourceLine
  );

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500"></span>
          Assembly Code
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {assemblyCode.length} instruction{assemblyCode.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Assembly Instructions */}
      <div className="flex-1 overflow-y-auto p-4">
        {assemblyCode.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-gray-400 dark:text-gray-600 text-sm">
            No assembly code generated
          </div>
        ) : (
          <div className="space-y-1 font-mono text-xs">
            <AnimatePresence mode="sync">
              {assemblyCode.map((inst, index) => {
                const isActive = activeInstructions.some(a => a.lineNumber === inst.lineNumber);
                const isPrevActive = index > 0 && activeInstructions.some(
                  a => a.lineNumber === assemblyCode[index - 1].lineNumber
                );

                return (
                  <motion.div
                    key={`${inst.lineNumber}-${inst.instruction}`}
                    initial={{ opacity: 0.5 }}
                    animate={{
                      opacity: 1,
                      backgroundColor: isActive
                        ? 'rgb(34, 197, 94)' // green-500
                        : 'transparent',
                      scale: isActive ? 1.02 : 1,
                    }}
                    transition={{ duration: 0.2 }}
                    className={`flex items-start gap-3 px-2 py-1.5 rounded ${
                      isActive ? 'text-white font-semibold' : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {/* Line Number */}
                    <span className={`w-8 text-right flex-shrink-0 ${
                      isActive ? 'text-white' : 'text-gray-400 dark:text-gray-600'
                    }`}>
                      {inst.lineNumber.toString().padStart(3, '0')}
                    </span>

                    {/* Instruction */}
                    <div className="flex-1 flex items-start gap-2">
                      {/* Label or Instruction */}
                      {inst.instruction === 'LABEL' ? (
                        <span className={`font-bold ${
                          isActive ? 'text-white' : 'text-purple-600 dark:text-purple-400'
                        }`}>
                          {inst.operands[0]}:
                        </span>
                      ) : (
                        <>
                          <span className={`w-12 font-bold ${
                            isActive ? 'text-white' : getInstructionColor(inst.instruction)
                          }`}>
                            {inst.instruction}
                          </span>
                          <span className={isActive ? 'text-white' : 'text-gray-600 dark:text-gray-400'}>
                            {inst.operands.join(', ')}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Source Line Indicator */}
                    <span className={`text-xs flex-shrink-0 ${
                      isActive ? 'text-white/80' : 'text-gray-400 dark:text-gray-600'
                    }`}>
                      ← L{inst.sourceLineNumber}
                    </span>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex-shrink-0 px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
          <div className="font-semibold mb-2">Instruction Set:</div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            <div><span className="font-mono text-blue-600 dark:text-blue-400">LOAD</span> - Load value</div>
            <div><span className="font-mono text-blue-600 dark:text-blue-400">STORE</span> - Store value</div>
            <div><span className="font-mono text-green-600 dark:text-green-400">ADD/SUB</span> - Arithmetic</div>
            <div><span className="font-mono text-green-600 dark:text-green-400">MUL/DIV</span> - Arithmetic</div>
            <div><span className="font-mono text-purple-600 dark:text-purple-400">CALL</span> - Function call</div>
            <div><span className="font-mono text-purple-600 dark:text-purple-400">RET</span> - Return</div>
            <div><span className="font-mono text-yellow-600 dark:text-yellow-400">PUSH</span> - Push to stack</div>
            <div><span className="font-mono text-yellow-600 dark:text-yellow-400">ALLOC</span> - Allocate memory</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Get color class for instruction type
 */
function getInstructionColor(instruction: string): string {
  switch (instruction) {
    case 'LOAD':
    case 'STORE':
      return 'text-blue-600 dark:text-blue-400';
    case 'ADD':
    case 'SUB':
    case 'MUL':
    case 'DIV':
      return 'text-green-600 dark:text-green-400';
    case 'CALL':
    case 'RET':
    case 'LABEL':
      return 'text-purple-600 dark:text-purple-400';
    case 'PUSH':
    case 'POP':
    case 'ALLOC':
      return 'text-yellow-600 dark:text-yellow-400';
    case 'CMP':
    case 'JMP':
    case 'JG':
    case 'JL':
    case 'JE':
      return 'text-red-600 dark:text-red-400';
    default:
      return 'text-gray-600 dark:text-gray-400';
  }
}
