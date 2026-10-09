'use client';

import { StackFrame } from '@/lib/algo-verse/types';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useEffect, useRef } from 'react';

interface StackVisualizerProps {
  stack: StackFrame[];
  onHeapReferenceClick?: (address: string) => void;
}

export function StackVisualizer({ stack, onHeapReferenceClick }: StackVisualizerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new items added
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [stack.length]);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-border bg-muted">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary"></span>
          Call Stack
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          {stack.length} frame{stack.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Stack Frames */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        <AnimatePresence mode="popLayout">
          {stack.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center h-32 text-muted-foreground text-sm"
            >
              Stack is empty
            </motion.div>
          ) : (
            /* Render stack from top to bottom (reverse order) */
            [...stack].reverse().map((frame, index) => {
              const isTopFrame = index === 0;
              
              return (
                <motion.div
                  key={frame.id}
                  layout
                  initial={{ opacity: 0, y: -20, scale: 0.9 }}
                  animate={{ 
                    opacity: 1, 
                    y: 0, 
                    scale: 1,
                    transition: {
                      type: 'spring',
                      stiffness: 500,
                      damping: 30,
                    }
                  }}
                  exit={{ 
                    opacity: 0, 
                    x: 100, 
                    scale: 0.8,
                    transition: {
                      duration: 0.2,
                    }
                  }}
                  className={`relative rounded-lg border-2 p-4 ${
                    isTopFrame
                      ? 'border-primary bg-primary/10'
                      : 'border-input bg-card'
                  }`}
                >
                  {/* Top frame indicator */}
                  {isTopFrame && (
                    <div className="absolute -top-2 -right-2 px-2 py-0.5 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                      Current
                    </div>
                  )}

                  {/* Function name */}
                  <div className="flex items-center gap-2 mb-3">
                    <code className="text-sm font-bold text-foreground">
                      {frame.functionName}()
                    </code>
                    <span className="text-xs text-muted-foreground">
                      Line {frame.lineNumber}
                    </span>
                  </div>

                  {/* Variables */}
                  {frame.variables.length > 0 ? (
                    <div className="space-y-2">
                      <div className="text-xs font-medium text-muted-foreground">
                        Local Variables:
                      </div>
                      {frame.variables.map((variable, varIndex) => (
                        <motion.div
                          key={`${frame.id}-${variable.name}-${varIndex}`}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: varIndex * 0.1 }}
                          className="flex items-center justify-between text-xs bg-muted rounded px-2 py-1.5"
                        >
                          <span className="font-mono text-foreground">
                            {variable.name}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">
                              {variable.type}
                            </span>
                            {(variable.type === 'object' || variable.type === 'array') && variable.heapReference ? (
                              <Button
                                variant="link"
                                size="sm"
                                className="h-auto p-0 font-mono"
                                onClick={() => onHeapReferenceClick?.(variable.heapReference!)}
                                title={`View ${variable.type} at ${variable.heapReference}`}
                              >
                                → {variable.heapReference}
                              </Button>
                            ) : (
                              <span className="font-mono text-foreground">
                                {String(variable.value).substring(0, 20)}
                              </span>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-muted-foreground italic">
                      No local variables
                    </div>
                  )}

                  {/* Return address */}
                  {frame.returnAddress && (
                    <div className="mt-3 pt-2 border-t border-border text-xs text-muted-foreground">
                      Return to line {frame.returnAddress}
                    </div>
                  )}
                </motion.div>
              );
            })
          )}
        </AnimatePresence>

        {/* Stack pointer indicator */}
        {stack.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-xs text-muted-foreground pt-2"
          >
            <span className="font-mono">SP →</span>
            <span>Stack Pointer</span>
          </motion.div>
        )}
      </div>
    </div>
  );
}
