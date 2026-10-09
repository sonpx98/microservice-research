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
      <div className="flex-shrink-0 px-4 py-3 border-b border-border bg-muted">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-chart-4"></span>
          Heap Memory
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
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
              className="flex items-center justify-center h-32 text-muted-foreground text-sm"
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
                      ? 'border-chart-4 bg-chart-4/10 ring-2 ring-chart-4/40'
                      : 'border-chart-4/30 bg-chart-4/10'
                  }`}
                >
                {/* Memory Address */}
                {showAddresses && (
                  <div className="absolute -top-2 -right-2 px-2 py-0.5 bg-chart-4 text-primary-foreground text-xs font-mono rounded">
                    {obj.address}
                  </div>
                )}

                {/* Object Type */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2 py-0.5 bg-chart-4/20 text-chart-4 text-xs font-medium rounded">
                    {obj.type}
                  </span>
                  <code className="text-xs font-mono text-muted-foreground">
                    {obj.id}
                  </code>
                </div>

                {/* Object Data */}
                <div className="space-y-2">
                  <div className="text-xs font-medium text-muted-foreground">
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
                          className="flex items-center justify-between text-xs bg-card rounded px-2 py-1.5 border border-chart-4/30"
                        >
                          <span className="font-mono text-chart-4">
                            {key}:
                          </span>
                          <span className="font-mono text-foreground">
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
                    <div className="text-xs text-muted-foreground italic">
                      Empty {obj.type}
                    </div>
                  )}
                </div>

                {/* References to other heap objects */}
                {obj.references.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-chart-4/30">
                    <div className="text-xs font-medium text-muted-foreground mb-2">
                      References:
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {obj.references.map((refId) => (
                        <motion.span
                          key={refId}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="px-2 py-0.5 bg-chart-4/10 text-chart-4 text-xs font-mono rounded border border-chart-4/30"
                        >
                          → {refId}
                        </motion.span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Timestamp (for debugging) */}
                <div className="mt-2 text-xs text-muted-foreground">
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
