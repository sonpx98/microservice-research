'use client';

import { useState, useEffect, useCallback } from 'react';
import { CodeEditor } from './code-editor';
import { ExecutionControls } from './execution-controls';
import { MemoryPanel } from './memory-panel';
import { ASTExecutionEngine } from '@/lib/algo-verse/execution-engine-ast';
import { generateAssemblyCode } from '@/lib/algo-verse/assembly-translator';
import { createInitialCPUState, updateCPUState } from '@/lib/algo-verse/cpu-state-generator';
import { codeExamples, getExampleById } from '@/lib/algo-verse/examples';
import { ExecutionStep, CodeExample, Variable, AssemblyInstruction, CPUState } from '@/lib/algo-verse/types';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

// Parent passes key={exampleId} so a new example remounts instead of syncing state in an effect.
export function MemoryVisualizer({ initialExampleId }: { initialExampleId?: string }) {
  const [code, setCode] = useState(
    () => (initialExampleId && getExampleById(initialExampleId)?.code) || codeExamples[0].code,
  );
  const [engine, setEngine] = useState<ASTExecutionEngine | null>(null);
  const [currentStep, setCurrentStep] = useState<ExecutionStep | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [output, setOutput] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [assemblyCode, setAssemblyCode] = useState<AssemblyInstruction[]>([]);
  const [cpuState, setCpuState] = useState<CPUState | null>(null);

  // Initialize engine when code changes
  useEffect(() => {
    try {
      const newEngine = new ASTExecutionEngine(code);
      setEngine(newEngine);
      setTotalSteps(newEngine.getTotalSteps());
      setCurrentStepIndex(0);
      setCurrentStep(newEngine.getCurrentStep());
      setOutput([]);
      setError(null);
      setIsPlaying(false);
      
      // Generate assembly code
      const assembly = generateAssemblyCode(code);
      setAssemblyCode(assembly);
      
      // Initialize CPU state
      const initialCPU = createInitialCPUState(assembly);
      setCpuState(initialCPU);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse code');
      setEngine(null);
      setAssemblyCode([]);
      setCpuState(null);
    }
  }, [code]);

  // Auto-play functionality
  useEffect(() => {
    if (!isPlaying || !engine) return;

    const interval = setInterval(() => {
      const nextStep = engine.nextStep();
      if (nextStep) {
        setCurrentStep(nextStep);
        setCurrentStepIndex(engine.getCurrentStepIndex());
        if (nextStep.state.output.length > 0) {
          setOutput(nextStep.state.output);
        }
        // Update CPU state during auto-play (functional update to avoid stale closure)
        setCpuState(prevCpuState => {
          if (!prevCpuState) return prevCpuState;
          return updateCPUState(
            prevCpuState,
            nextStep.lineNumber,
            nextStep.action,
            assemblyCode
          );
        });
      } else {
        setIsPlaying(false);
      }
    }, 1000 / speed);

    return () => clearInterval(interval);
  }, [isPlaying, engine, speed, assemblyCode]);

  const handlePlay = useCallback(() => {
    setIsPlaying(true);
  }, []);

  const handlePause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const handleStepForward = useCallback(() => {
    if (!engine || !cpuState) return;
    const nextStep = engine.nextStep();
    if (nextStep) {
      setCurrentStep(nextStep);
      setCurrentStepIndex(engine.getCurrentStepIndex());
      if (nextStep.state.output.length > 0) {
        setOutput(nextStep.state.output);
      }
      // Update CPU state
      const newCPUState = updateCPUState(
        cpuState,
        nextStep.lineNumber,
        nextStep.action,
        assemblyCode
      );
      setCpuState(newCPUState);
    }
  }, [engine, cpuState, assemblyCode]);

  const handleStepBackward = useCallback(() => {
    if (!engine || !cpuState) return;
    const prevStep = engine.previousStep();
    if (prevStep) {
      setCurrentStep(prevStep);
      setCurrentStepIndex(engine.getCurrentStepIndex());
      if (prevStep.state.output.length > 0) {
        setOutput(prevStep.state.output);
      }
      // Update CPU state
      const newCPUState = updateCPUState(
        cpuState,
        prevStep.lineNumber,
        prevStep.action,
        assemblyCode
      );
      setCpuState(newCPUState);
    }
  }, [engine, cpuState, assemblyCode]);

  const handleReset = useCallback(() => {
    if (!engine) return;
    setIsPlaying(false);
    engine.reset();
    setCurrentStep(engine.getCurrentStep());
    setCurrentStepIndex(0);
    setOutput([]);
    // Reset CPU state
    const initialCPU = createInitialCPUState(assemblyCode);
    setCpuState(initialCPU);
  }, [engine, assemblyCode]);

  const handleExampleSelect = useCallback((example: CodeExample) => {
    setCode(example.code);
  }, []);

  const handleCodeChange = useCallback((newCode: string) => {
    setCode(newCode);
  }, []);

  return (
    <div className="h-full flex flex-col gap-4">
      {/* Error Display */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-3 p-4 bg-danger/10 border border-danger/30 rounded-lg"
          >
            <AlertCircle className="w-5 h-5 text-danger flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-danger">
                Parsing Error
              </p>
              <p className="text-xs text-danger mt-1">
                {error}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 overflow-hidden">
        {/* Left Column: Code Editor */}
        <div className="grid grid-rows-[600px_200px] gap-3 overflow-hidden">
          <div className="overflow-hidden h-[600px]">
            <CodeEditor
              code={code}
              currentLine={currentStep?.lineNumber || 0}
              examples={codeExamples}
              onCodeChange={handleCodeChange}
              onExampleSelect={handleExampleSelect}
              disabled={isPlaying}
            />
          </div>

          {/* Execution Controls */}
          <ExecutionControls
            isPlaying={isPlaying}
            currentStep={currentStepIndex}
            totalSteps={totalSteps}
            speed={speed}
            onPlay={handlePlay}
            onPause={handlePause}
            onStepForward={handleStepForward}
            onStepBackward={handleStepBackward}
            onReset={handleReset}
            onSpeedChange={setSpeed}
            disabled={!engine || !!error}
          />
        </div>

        {/* Right Column: Memory Visualization */}
        <div className="grid grid-rows-[600px_200px] gap-3 overflow-hidden">
          <div className="overflow-hidden h-[600px]">
            <MemoryPanel
              stack={currentStep?.state.stack || []}
              heap={currentStep?.state.heap || []}
              showAddresses={true}
              assemblyCode={assemblyCode}
              currentLine={currentStep?.lineNumber || 0}
              cpuRegisters={cpuState?.registers}
            />
          </div>

          {/* Current Step Info */}
          {currentStep && (
            <motion.div
              layout
              className="h-[200px] overflow-y-auto p-4 rounded-xl border border-border bg-card"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                  {currentStep.stepNumber}
                </div>
                <div className="flex-1">
                  <div className="text-xs font-medium text-muted-foreground mb-1">
                    {currentStep.action.replace(/_/g, ' ').toUpperCase()}
                  </div>
                  <p className="text-sm font-medium text-foreground">
                    {currentStep.description}
                  </p>
                  
                  {/* Global Variables */}
                  {currentStep.state.globalVariables.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <div className="text-xs font-medium text-muted-foreground mb-2">
                        Global Scope:
                      </div>
                      <div className="space-y-1">
                        {currentStep.state.globalVariables.map((variable: Variable, index: number) => (
                          <div
                            key={`global-${variable.name}-${index}`}
                            className="flex items-center justify-between text-xs bg-card rounded px-2 py-1"
                          >
                            <span className="font-mono text-foreground">
                              {variable.name}
                            </span>
                            <span className="font-mono text-foreground">
                              {variable.type === 'object' && variable.heapReference
                                ? `→ ${variable.heapReference}`
                                : String(variable.value)
                              }
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Output */}
                  {output.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <div className="text-xs font-medium text-muted-foreground mb-2">
                        Console Output:
                      </div>
                      <div data-theme="terminal" className="bg-background rounded px-3 py-2 font-mono text-xs text-success">
                        {output.map((line, index) => (
                          <div key={index}>{line}</div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
