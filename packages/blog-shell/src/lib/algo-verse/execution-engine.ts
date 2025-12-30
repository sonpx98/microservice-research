import { ExecutionStep, ExecutionState, StackFrame, HeapObject, Variable, VariableType, ActionType } from './types';

/**
 * Execution Engine for Algo Verse
 * Parses and executes JavaScript code step-by-step for visualization
 * 
 * Note: This is a simplified execution engine for demonstration purposes.
 * It handles basic function calls, variable assignments, and object creation.
 */

export class ExecutionEngine {
    private code: string;
    private steps: ExecutionStep[];
    private currentStepIndex: number;

    constructor(code: string) {
        this.code = code;
        this.steps = [];
        this.currentStepIndex = 0;
        this.parseCode();
    }

    /**
     * Helper method to determine current scope context
     * @param stack Current call stack
     * @returns 'local' if inside a function, 'global' if at top level
     */
    private getCurrentScope(stack: StackFrame[]): 'global' | 'local' {
        return stack.length > 0 ? 'local' : 'global';
    }

    /**
     * Parse code into execution steps
     * This is a simplified parser - in production, you'd use a proper AST parser
     */
    private parseCode(): void {
        const lines = this.code.split('\n').filter(line => line.trim() !== '');
        let stepNumber = 0;
        let stack: StackFrame[] = [];
        let heap: HeapObject[] = [];
        let globalVariables: Variable[] = [];
        let output: string[] = [];

        // Track function definitions
        const functions: Map<string, { startLine: number; endLine: number; params: string[] }> = new Map();
        let currentFunctionName: string | null = null;
        let currentFunctionStart = -1;
        let braceCount = 0;

        // First pass: identify functions
        lines.forEach((line, index) => {
            const trimmed = line.trim();
            const funcMatch = trimmed.match(/function\s+(\w+)\s*\((.*?)\)/);

            if (funcMatch) {
                currentFunctionName = funcMatch[1];
                currentFunctionStart = index;
                const params = funcMatch[2].split(',').map(p => p.trim()).filter(p => p);
                functions.set(currentFunctionName, { startLine: index, endLine: -1, params });
            }

            // Count braces to find function end
            for (const char of trimmed) {
                if (char === '{') braceCount++;
                if (char === '}') braceCount--;
            }

            if (currentFunctionName && braceCount === 0 && trimmed.includes('}')) {
                const func = functions.get(currentFunctionName);
                if (func) {
                    func.endLine = index;
                }
                currentFunctionName = null;
            }
        });

        // Initial state
        this.steps.push({
            stepNumber: stepNumber++,
            lineNumber: 0,
            action: 'expression_evaluation',
            description: 'Program starts',
            state: {
                currentLine: 0,
                stack: [],
                heap: [],
                globalVariables: [],
                output: [],
                isComplete: false,
            },
        });

        // Second pass: execute code
        lines.forEach((line, index) => {
            const trimmedLine = line.trim();
            const lineNumber = index + 1;

            // Check if this line is inside any function body
            let insideFunction = false;
            for (const [funcName, funcDef] of functions.entries()) {
                if (index >= funcDef.startLine && index <= funcDef.endLine) {
                    insideFunction = true;
                    break;
                }
            }

            // Skip all lines inside function bodies
            if (insideFunction) {
                return;
            }

            // Variable declaration with function call
            if ((trimmedLine.includes('const ') || trimmedLine.includes('let ')) && trimmedLine.includes('(') && !trimmedLine.includes('{')) {
                const match = trimmedLine.match(/(const|let)\s+(\w+)\s*=\s*(\w+)\((.*?)\)/);
                if (match) {
                    const [, , varName, funcName, argsStr] = match;
                    const args = argsStr.split(',').map(a => a.trim()).filter(a => a);

                    // Check if this function creates objects
                    const funcDef = functions.get(funcName);
                    let createsObject = false;

                    if (funcDef) {
                        const funcBody = lines.slice(funcDef.startLine, funcDef.endLine + 1).join('\n');
                        // Check if function body contains object literal pattern
                        createsObject = funcBody.includes('const') && funcBody.includes('{') &&
                            (funcBody.includes(':') || !!funcBody.match(/\w+:\s*\w+/));
                    }

                    // Function call - create stack frame
                    const frameId = `frame-${stepNumber}`;
                    const newFrame: StackFrame = {
                        id: frameId,
                        functionName: funcName,
                        lineNumber,
                        variables: funcDef ? funcDef.params.map((param, i) => ({
                            name: param,
                            value: args[i] || 'undefined',
                            type: 'string' as VariableType,
                            scope: 'local' as const, // Function parameters are local variables
                        })) : [],
                        timestamp: Date.now(),
                    };

                    stack = [...stack, newFrame];

                    this.steps.push({
                        stepNumber: stepNumber++,
                        lineNumber,
                        action: 'function_call',
                        description: `Call ${funcName}(${argsStr})`,
                        state: {
                            currentLine: lineNumber,
                            stack: JSON.parse(JSON.stringify(stack)),
                            heap: JSON.parse(JSON.stringify(heap)),
                            globalVariables: JSON.parse(JSON.stringify(globalVariables)),
                            output: [...output],
                            isComplete: false,
                        },
                    });

                    // If function creates object, simulate object creation
                    if (createsObject) {
                        const heapId = `heap-${heap.length + 1}`;
                        const address = `0x${Math.random().toString(16).substring(2, 8).toUpperCase()}`;

                        // Parse object properties from function body
                        const objectData: Record<string, any> = {};
                        if (funcDef) {
                            const funcBody = lines.slice(funcDef.startLine + 1, funcDef.endLine);
                            funcBody.forEach(bodyLine => {
                                const propMatch = bodyLine.match(/(\w+):\s*(\w+)/);
                                if (propMatch) {
                                    const [, key, value] = propMatch;
                                    // Try to resolve parameter value
                                    const paramIndex = funcDef.params.indexOf(value);
                                    objectData[key] = paramIndex >= 0 ? args[paramIndex] : value;
                                }
                            });
                        }

                        const newHeapObject: HeapObject = {
                            id: heapId,
                            address,
                            type: 'object',
                            data: objectData,
                            references: [],
                            timestamp: Date.now(),
                        };

                        heap = [...heap, newHeapObject];

                        // Add object variable to stack frame (local scope)
                        if (stack.length > 0) {
                            stack[stack.length - 1].variables.push({
                                name: 'user', // This will be the local variable name in the function
                                value: heapId,
                                type: 'object',
                                heapReference: address,
                                scope: 'local',
                            });
                        }

                        this.steps.push({
                            stepNumber: stepNumber++,
                            lineNumber,
                            action: 'object_creation',
                            description: `Create object in heap at ${address}`,
                            state: {
                                currentLine: lineNumber,
                                stack: JSON.parse(JSON.stringify(stack)),
                                heap: JSON.parse(JSON.stringify(heap)),
                                globalVariables: JSON.parse(JSON.stringify(globalVariables)),
                                output: [...output],
                                isComplete: false,
                            },
                        });
                    }

                    // Function return
                    stack = stack.slice(0, -1);

                    // Determine scope for the returned value assignment
                    const currentScope = this.getCurrentScope(stack);

                    const newVar: Variable = {
                        name: varName,
                        value: createsObject ? heap[heap.length - 1]?.id || 'object' : `result from ${funcName}`,
                        type: createsObject ? 'object' : 'string',
                        heapReference: createsObject ? heap[heap.length - 1]?.address : undefined,
                        scope: currentScope,
                    };

                    // Add to appropriate scope
                    if (currentScope === 'local' && stack.length > 0) {
                        stack[stack.length - 1].variables.push(newVar);
                    } else {
                        globalVariables = [...globalVariables, newVar];
                    }

                    this.steps.push({
                        stepNumber: stepNumber++,
                        lineNumber,
                        action: 'function_return',
                        description: `${funcName} returns${createsObject ? ' object' : ''}, assign to ${varName}`,
                        state: {
                            currentLine: lineNumber,
                            stack: JSON.parse(JSON.stringify(stack)),
                            heap: JSON.parse(JSON.stringify(heap)),
                            globalVariables: JSON.parse(JSON.stringify(globalVariables)),
                            output: [...output],
                            isComplete: false,
                        },
                    });
                }
            }
            // Console.log
            else if (trimmedLine.includes('console.log')) {
                const match = trimmedLine.match(/console\.log\((.*?)\)/);
                if (match) {
                    const logValue = match[1];

                    // Try to resolve variable value
                    let resolvedValue = logValue;
                    const variable = globalVariables.find(v => v.name === logValue);
                    if (variable) {
                        if (variable.type === 'object' && variable.heapReference) {
                            const heapObj = heap.find(h => h.address === variable.heapReference);
                            resolvedValue = heapObj ? JSON.stringify(heapObj.data) : variable.value;
                        } else {
                            resolvedValue = String(variable.value);
                        }
                    }

                    // Handle property access like person.name
                    const propMatch = logValue.match(/(\w+)\.(\w+)/);
                    if (propMatch) {
                        const [, objName, propName] = propMatch;
                        const objVar = globalVariables.find(v => v.name === objName);
                        if (objVar && objVar.heapReference) {
                            const heapObj = heap.find(h => h.address === objVar.heapReference);
                            if (heapObj && heapObj.data[propName]) {
                                resolvedValue = String(heapObj.data[propName]);
                            }
                        }
                    }

                    output = [...output, resolvedValue];

                    this.steps.push({
                        stepNumber: stepNumber++,
                        lineNumber,
                        action: 'console_log',
                        description: `Log: ${resolvedValue}`,
                        state: {
                            currentLine: lineNumber,
                            stack: JSON.parse(JSON.stringify(stack)),
                            heap: JSON.parse(JSON.stringify(heap)),
                            globalVariables: JSON.parse(JSON.stringify(globalVariables)),
                            output: [...output],
                            isComplete: false,
                        },
                    });
                }
            }
            // Simple variable assignment (not function call)
            else if ((trimmedLine.includes('const ') || trimmedLine.includes('let ')) && !trimmedLine.includes('(')) {
                const match = trimmedLine.match(/(const|let)\s+(\w+)\s*=\s*(.+?);?$/);
                if (match) {
                    const [, , varName, value] = match;

                    // Check if value is an object literal
                    if (value.trim().startsWith('{')) {
                        // Object literal - create heap object
                        const heapId = `heap-${heap.length + 1}`;
                        const address = `0x${Math.random().toString(16).substring(2, 8).toUpperCase()}`;

                        // Parse object properties
                        const objectData: Record<string, any> = {};
                        const propsMatch = value.match(/\{(.+?)\}/);
                        if (propsMatch) {
                            const propsStr = propsMatch[1];
                            const props = propsStr.split(',').map(p => p.trim());

                            props.forEach(prop => {
                                const propMatch = prop.match(/(\w+):\s*(.+)/);
                                if (propMatch) {
                                    const [, key, val] = propMatch;
                                    // Try to resolve variable value or use literal
                                    const resolvedValue = val.trim().replace(/['"]/g, '');

                                    // Check if it's a variable reference
                                    const refVar = [...globalVariables, ...(stack.length > 0 ? stack[stack.length - 1].variables : [])].find(v => v.name === resolvedValue);
                                    objectData[key] = refVar ? refVar.value : resolvedValue;
                                }
                            });
                        }

                        const newHeapObject: HeapObject = {
                            id: heapId,
                            address,
                            type: 'object',
                            data: objectData,
                            references: [],
                            timestamp: Date.now(),
                        };

                        heap = [...heap, newHeapObject];

                        // Determine current scope
                        const currentScope = this.getCurrentScope(stack);

                        const newVar: Variable = {
                            name: varName,
                            value: heapId,
                            type: 'object',
                            heapReference: address,
                            scope: currentScope,
                        };

                        // Add to appropriate scope
                        if (currentScope === 'local' && stack.length > 0) {
                            stack[stack.length - 1].variables.push(newVar);
                        } else {
                            globalVariables = [...globalVariables, newVar];
                        }

                        this.steps.push({
                            stepNumber: stepNumber++,
                            lineNumber,
                            action: 'object_creation',
                            description: `Create object ${varName} in heap at ${address}`,
                            state: {
                                currentLine: lineNumber,
                                stack: JSON.parse(JSON.stringify(stack)),
                                heap: JSON.parse(JSON.stringify(heap)),
                                globalVariables: JSON.parse(JSON.stringify(globalVariables)),
                                output: [...output],
                                isComplete: false,
                            },
                        });
                    } else {
                        // Regular variable assignment (primitives)
                        const currentScope = this.getCurrentScope(stack);
                        const newVar: Variable = {
                            name: varName,
                            value: value.replace(/['"]/g, ''),
                            type: 'string',
                            scope: currentScope,
                        };

                        // Add to appropriate scope
                        if (currentScope === 'local' && stack.length > 0) {
                            stack[stack.length - 1].variables.push(newVar);
                        } else {
                            globalVariables = [...globalVariables, newVar];
                        }

                        this.steps.push({
                            stepNumber: stepNumber++,
                            lineNumber,
                            action: 'variable_declaration',
                            description: `Declare ${varName} = ${value}`,
                            state: {
                                currentLine: lineNumber,
                                stack: JSON.parse(JSON.stringify(stack)),
                                heap: JSON.parse(JSON.stringify(heap)),
                                globalVariables: JSON.parse(JSON.stringify(globalVariables)),
                                output: [...output],
                                isComplete: false,
                            },
                        });
                    }
                }
            }
        });

        // Final state
        this.steps.push({
            stepNumber: stepNumber++,
            lineNumber: lines.length,
            action: 'expression_evaluation',
            description: 'Program complete',
            state: {
                currentLine: lines.length,
                stack: [],
                heap: JSON.parse(JSON.stringify(heap)),
                globalVariables: JSON.parse(JSON.stringify(globalVariables)),
                output: [...output],
                isComplete: true,
            },
        });
    }

    /**
     * Get all execution steps
     */
    getSteps(): ExecutionStep[] {
        return this.steps;
    }

    /**
     * Get current step
     */
    getCurrentStep(): ExecutionStep | null {
        return this.steps[this.currentStepIndex] || null;
    }

    /**
     * Get step by index
     */
    getStep(index: number): ExecutionStep | null {
        return this.steps[index] || null;
    }

    /**
     * Get total number of steps
     */
    getTotalSteps(): number {
        return this.steps.length;
    }

    /**
     * Move to next step
     */
    nextStep(): ExecutionStep | null {
        if (this.currentStepIndex < this.steps.length - 1) {
            this.currentStepIndex++;
            return this.getCurrentStep();
        }
        return null;
    }

    /**
     * Move to previous step
     */
    previousStep(): ExecutionStep | null {
        if (this.currentStepIndex > 0) {
            this.currentStepIndex--;
            return this.getCurrentStep();
        }
        return null;
    }

    /**
     * Reset to first step
     */
    reset(): void {
        this.currentStepIndex = 0;
    }

    /**
     * Jump to specific step
     */
    goToStep(index: number): ExecutionStep | null {
        if (index >= 0 && index < this.steps.length) {
            this.currentStepIndex = index;
            return this.getCurrentStep();
        }
        return null;
    }

    /**
     * Get current step index
     */
    getCurrentStepIndex(): number {
        return this.currentStepIndex;
    }
}
