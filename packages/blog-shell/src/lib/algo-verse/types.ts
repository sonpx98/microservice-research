/**
 * Algo Verse - Type Definitions
 * Core types for execution visualization
 */

export type VariableType = 'number' | 'string' | 'boolean' | 'object' | 'array' | 'function' | 'undefined' | 'null';

/**
 * Variable representation
 * - For primitives: value contains the actual value
 * - For objects/arrays: value contains the heap ID, heapReference contains the memory address
 * - scope tracks whether this is a global or local variable
 */
export interface Variable {
    name: string;
    value: any; // For primitives: actual value; For objects: heap ID
    type: VariableType;
    heapReference?: string; // Memory address for heap-allocated objects (e.g., "0x1A2B3C")
    scope?: 'global' | 'local'; // Variable scope - global (top-level) or local (function)
}

/**
 * Stack Frame representation
 * Represents a function call on the call stack
 * - variables: Contains ONLY local variables (parameters + local declarations)
 * - Each frame is destroyed when the function returns
 */
export interface StackFrame {
    id: string;
    functionName: string;
    lineNumber: number;
    variables: Variable[]; // Local variables only (parameters + local declarations)
    returnAddress?: number; // Line to return to after function completes
    timestamp: number;
}

export interface HeapObject {
    id: string;
    address: string; // Simulated memory address (e.g., "0x1A2B3C")
    type: 'object' | 'array' | 'closure';
    data: Record<string, any> | any[];
    references: string[]; // IDs of other heap objects this references
    timestamp: number;
}

/**
 * Closure Environment
 * Stores captured variables from outer scope for closures/currying
 */
export interface ClosureEnvironment {
    id: string;
    address: string; // Memory address like heap objects
    capturedVariables: Record<string, any>; // Variables from outer scope
    parentEnvironment?: string; // Chain to outer closure environment
    timestamp: number;
}

/**
 * Event Loop & Async Operations
 */

export interface Task {
    id: string;
    type: 'macrotask' | 'microtask';
    description: string;
    callback: string; // Function name or code
    delay?: number; // For setTimeout
    timestamp: number;
}

export interface WebAPI {
    id: string;
    type: 'timeout' | 'interval' | 'fetch' | 'promise';
    description: string;
    startTime: number;
    duration?: number;
    taskId?: string; // Associated task ID
}

export interface EventLoopState {
    callStack: StackFrame[];
    taskQueue: Task[];
    microtaskQueue: Task[];
    webAPIs: WebAPI[];
    currentPhase: 'stack' | 'microtasks' | 'tasks' | 'idle';
}

/**
 * CPU Execution Simulator Types
 */

// CPU Register types
export interface CPURegisters {
    pc: number;           // Program Counter
    ir: string;           // Instruction Register
    acc: number;          // Accumulator
    r0: number;           // General purpose register 0
    r1: number;           // General purpose register 1
    r2: number;           // General purpose register 2
    r3: number;           // General purpose register 3
}

// Pipeline stages
export type PipelineStage = 'fetch' | 'decode' | 'execute' | 'memory' | 'writeback';

export interface PipelineInstruction {
    id: string;
    instruction: string;
    stage: PipelineStage;
    cycleNumber: number;
}

// Assembly instruction
export interface AssemblyInstruction {
    lineNumber: number;
    instruction: string;
    operands: string[];
    sourceLineNumber: number; // Maps back to JS source
    isActive: boolean;
}

// CPU State for execution steps
export interface CPUState {
    registers: CPURegisters;
    pipeline: PipelineInstruction[];
    assemblyCode: AssemblyInstruction[];
    cycleCount: number;
}

/**
 * Execution State Types
 */

/**
 * Execution State at a given step
 * - stack: Call stack containing function frames with local variables
 * - globalVariables: Top-level variables declared outside any function
 * - heap: Dynamically allocated objects and arrays
 */
export interface ExecutionState {
    currentLine: number;
    stack: StackFrame[]; // Call stack with local scopes
    heap: HeapObject[]; // Heap-allocated objects
    globalVariables: Variable[]; // Global scope variables only
    output: string[];
    isComplete: boolean;
    cpuState?: CPUState; // CPU registers and state
    // Event Loop state
    taskQueue?: Task[];
    microtaskQueue?: Task[];
    webAPIs?: WebAPI[];
    eventLoopPhase?: 'stack' | 'microtasks' | 'tasks' | 'idle';
}

export type ActionType =
    | 'function_call'
    | 'function_return'
    | 'variable_declaration'
    | 'variable_assignment'
    | 'object_creation'
    | 'array_creation'
    | 'expression_evaluation'
    | 'console_log'
    | 'async_operation'
    | 'task_execution';

export interface ExecutionStep {
    stepNumber: number;
    lineNumber: number;
    action: ActionType;
    description: string;
    state: ExecutionState;
    highlightedCode?: string;
}

export interface CodeExample {
    id: string;
    title: string;
    description: string;
    code: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface ExecutionConfig {
    speed: number; // Multiplier: 0.5x to 2x
    autoPlay: boolean;
    showMemoryAddresses: boolean;
    highlightCurrentLine: boolean;
}
