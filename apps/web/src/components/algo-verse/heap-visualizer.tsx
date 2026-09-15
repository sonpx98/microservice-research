'use client';

import { HeapObject } from '@/lib/algo-verse/types';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef } from 'react';

interface HeapVisualizerProps {
  heap: HeapObject[];
  showAddresses?: boolean;
  highlightedAddress?: string | null;
}

export function HeapVisualizer({ heap, showAddresses = true, highlightedAddress }: HeapVisualizerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new items added
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [heap.length]);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-purple-500"></span>
          Heap Memory
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {heap.length} object{heap.length !== 1 ? 's' : ''} allocated
        </p>
      </div>

      {/* Heap Objects */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        <AnimatePresence mode="popLayout">
          {heap.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center h-32 text-gray-400 dark:text-gray-600 text-sm"
            >
              Heap is empty
            </motion.div>
          ) : (
            heap.map((obj, index) => {
              const isHighlighted = highlightedAddress === obj.address;
              
              return (
                <motion.div
                  key={obj.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ 
                    opacity: 1, 
                    scale: isHighlighted ? 1.05 : 1, 
                    y: 0,
                    transition: {
                      type: 'spring',
                      stiffness: 400,
                      damping: 25,
                      delay: index * 0.05,
                    }
                  }}
                  exit={{ 
                    opacity: 0, 
                    scale: 0.8,
                    transition: {
                      duration: 0.2,
                    }
                  }}
                  className={`relative rounded-lg border-2 p-4 transition-all ${
                    isHighlighted
                      ? 'border-purple-500 bg-purple-100 dark:bg-purple-900/40 shadow-lg shadow-purple-500/50'
                      : 'border-purple-300 dark:border-purple-700 bg-purple-50 dark:bg-purple-950/20'
                  }`}
                >
                {/* Memory Address */}
                {showAddresses && (
                  <div className="absolute -top-2 -right-2 px-2 py-0.5 bg-purple-600 text-white text-xs font-mono rounded">
                    {obj.address}
                  </div>
                )}

                {/* Object Type */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2 py-0.5 bg-purple-200 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200 text-xs font-medium rounded">
                    {obj.type}
                  </span>
                  <code className="text-xs font-mono text-gray-600 dark:text-gray-400">
                    {obj.id}
                  </code>
                </div>

                {/* Object Data */}
                <div className="space-y-2">
                  <div className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    Properties:
                  </div>
                  
                  {Object.entries(obj.data).length > 0 ? (
                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                      {Object.entries(obj.data).map(([key, value], propIndex) => (
                        <motion.div
                          key={`${obj.id}-${key}`}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: propIndex * 0.05 }}
                          className="flex items-center justify-between text-xs bg-white dark:bg-gray-800 rounded px-2 py-1.5 border border-purple-200 dark:border-purple-800"
                        >
                          <span className="font-mono text-purple-700 dark:text-purple-300">
                            {key}:
                          </span>
                          <span className="font-mono text-gray-900 dark:text-white">
                            {typeof value === 'object' 
                              ? JSON.stringify(value)
                              : typeof value === 'string'
                              ? `"${value}"`
                              : String(value)
                            }
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-gray-400 dark:text-gray-600 italic">
                      Empty {obj.type}
                    </div>
                  )}
                </div>

                {/* References to other heap objects */}
                {obj.references.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-purple-200 dark:border-purple-800">
                    <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                      References:
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {obj.references.map((refId) => (
                        <motion.span
                          key={refId}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-mono rounded border border-purple-300 dark:border-purple-700"
                        >
                          → {refId}
                        </motion.span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Timestamp (for debugging) */}
                <div className="mt-2 text-xs text-gray-400 dark:text-gray-600">
                  Allocated: {new Date(obj.timestamp).toLocaleTimeString()}
                </div>
              </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
