import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import * as t from '@babel/types';
import { ExecutionStep, ExecutionState, StackFrame, HeapObject, Variable, VariableType, ActionType, Task, WebAPI } from './types';

/**
 * AST-based Execution Engine for Algo Verse
 * Uses Babel parser for accurate JavaScript parsing and execution visualization
 */
export class ASTExecutionEngine {
    private code: string;
    private steps: ExecutionStep[] = [];
    private currentStepIndex: number = 0;
    private ast: t.File | null = null;

    // Execution state
    private stepNumber: number = 0;
    private stack: StackFrame[] = [];
    private heap: HeapObject[] = [];
    private globalVariables: Variable[] = [];
    private output: string[] = [];

    // Function definitions map
    private functions: Map<string, {
        node: t.FunctionDeclaration;
        params: string[];
    }> = new Map();

    // Return value tracking for recursive calls
    private returnValues: Map<string, any> = new Map();
    private recursionDepth: number = 0;
    private maxRecursionDepth: number = 50;

    // Event Loop state
    private taskQueue: Task[] = [];
    private microtaskQueue: Task[] = [];
    private webAPIs: WebAPI[] = [];
    private timerId: number = 0;
    private currentPhase: 'stack' | 'microtasks' | 'tasks' | 'idle' = 'idle';
    private pendingCallbacks: Map<string, any> = new Map(); // Store callback AST nodes

    constructor(code: string) {
        this.code = code;
        this.parseAndExecute();
    }

    /**
     * Parse code into AST and generate execution steps
     */
    private parseAndExecute(): void {
        try {
            // Parse code into AST
            this.ast = parse(this.code, {
                sourceType: 'module',
                plugins: []
            });

            // Initial state
            this.addStep({
                stepNumber: this.stepNumber++,
                lineNumber: 0,
                action: 'expression_evaluation',
                description: 'Program starts',
                state: this.getCurrentState(),
            });

            // First pass: collect function definitions
            this.collectFunctions();

            // Second pass: execute top-level statements
            this.executeProgram();

            // Final state
            this.addStep({
                stepNumber: this.stepNumber++,
                lineNumber: this.getLastLineNumber(),
                action: 'expression_evaluation',
                description: 'Program complete',
                state: {
                    ...this.getCurrentState(),
                    isComplete: true,
                },
            });

        } catch (error) {
            console.error('Failed to parse code:', error);
            throw error;
        }
    }

    /**
     * First pass: collect all function definitions
     */
    private collectFunctions(): void {
        if (!this.ast) return;

        traverse(this.ast, {
            FunctionDeclaration: (path: any) => {
                const node = path.node;
                if (node.id) {
                    const funcName = node.id.name;
                    const params = node.params.map((param: any) =>
                        t.isIdentifier(param) ? param.name : 'unknown'
                    );

                    this.functions.set(funcName, {
                        node,
                        params
                    });
                }
            }
        });
    }

    /**
     * Second pass: execute top-level statements
     */
    private executeProgram(): void {
        if (!this.ast) return;

        const program = this.ast.program;

        for (const statement of program.body) {
            // Skip function declarations (already collected)
            if (t.isFunctionDeclaration(statement)) {
                continue;
            }

            // Execute statement
            this.executeStatement(statement);

            // Process event loop after each statement
            this.processEventLoop();
        }

        // Continue processing event loop until all tasks complete
        while (this.taskQueue.length > 0 || this.webAPIs.length > 0) {
            this.processEventLoop();
        }
    }

    /**
     * Execute a single statement
     */
    private executeStatement(statement: t.Statement): void {
        if (t.isVariableDeclaration(statement)) {
            this.handleVariableDeclaration(statement);
        } else if (t.isExpressionStatement(statement)) {
            this.handleExpressionStatement(statement);
        }
    }

    /**
     * Handle variable declaration (const/let/var)
     */
    private handleVariableDeclaration(node: t.VariableDeclaration): void {
        for (const declarator of node.declarations) {
            if (!t.isIdentifier(declarator.id)) continue;

            const varName = declarator.id.name;
            const init = declarator.init;

            if (!init) continue;

            // Check if it's a function call
            if (t.isCallExpression(init)) {
                this.handleFunctionCall(varName, init);
            }
            // Check if it's an object expression
            else if (t.isObjectExpression(init)) {
                this.handleObjectCreation(varName, init);
            }
            // Check if it's an array expression
            else if (t.isArrayExpression(init)) {
                this.handleArrayCreation(varName, init);
            }
            // Regular variable assignment
            else {
                this.handlePrimitiveAssignment(varName, init);
            }
        }
    }

    /**
     * Handle function call
     */
    private handleFunctionCall(
        resultVarName: string,
        callExpr: t.CallExpression,
        preEvaluatedArgs?: any[]
    ): any {
        if (!t.isIdentifier(callExpr.callee)) return undefined;

        const funcName = callExpr.callee.name;

        // Handle built-in async functions
        if (funcName === 'setTimeout') {
            return this.handleSetTimeout(callExpr, resultVarName);
        }

        const funcDef = this.functions.get(funcName);

        if (!funcDef) return undefined;

        // Check recursion depth
        this.recursionDepth++;
        if (this.recursionDepth > this.maxRecursionDepth) {
            console.warn('Max recursion depth exceeded');
            this.recursionDepth--;
            return undefined;
        }

        // Use pre-evaluated args if provided, otherwise evaluate them
        const args = preEvaluatedArgs || callExpr.arguments.map(arg => {
            if (t.isExpression(arg) || t.isSpreadElement(arg)) {
                return this.evaluateExpression(arg);
            }
            return 'unknown';
        });
        const lineNumber = callExpr.loc?.start.line || 0;

        // Create stack frame
        const frameId = `frame-${this.stepNumber}`;
        const newFrame: StackFrame = {
            id: frameId,
            functionName: funcName,
            lineNumber,
            variables: funcDef.params.map((param, i) => {
                const value = args[i] || 'undefined';

                // Check if value is a heap reference
                let actualType = this.inferType(value);
                let heapRef: string | undefined;

                if (typeof value === 'string' && value.startsWith('0x')) {
                    const heapObj = this.heap.find(h => h.address === value);
                    if (heapObj) {
                        // Convert closure to object for variable type (closures are represented as objects in variables)
                        actualType = heapObj.type === 'closure' ? 'object' : heapObj.type;
                        heapRef = value;
                    }
                }

                return {
                    name: param,
                    value: value,
                    type: actualType,
                    heapReference: heapRef,
                    scope: 'local' as const,
                };
            }),
            timestamp: Date.now(),
        };

        this.stack.push(newFrame);

        // Create closure environment if this is a nested function call
        if (this.stack.length > 1) {
            // Get parent frame (the frame that called this function)
            const parentFrame = this.stack[this.stack.length - 2];

            // Capture parent scope variables (excluding internal variables)
            const capturedVars: Record<string, any> = {};
            for (const variable of parentFrame.variables) {
                if (!variable.name.startsWith('__')) {
                    capturedVars[variable.name] = variable.value;
                }
            }

            // Only create closure environment if there are captured variables
            if (Object.keys(capturedVars).length > 0) {
                const closureId = `closure-${this.heap.length + 1}`;
                const closureAddress = `0x${Math.random().toString(16).substring(2, 8).toUpperCase()}`;

                const closureEnv: HeapObject = {
                    id: closureId,
                    address: closureAddress,
                    type: 'closure',
                    data: {
                        function: funcName,
                        capturedVariables: capturedVars,
                        parentFunction: parentFrame.functionName,
                    },
                    references: [],
                    timestamp: Date.now(),
                };

                this.heap.push(closureEnv);

                this.addStep({
                    stepNumber: this.stepNumber++,
                    lineNumber,
                    action: 'object_creation',
                    description: `Create closure environment for ${funcName} capturing ${Object.keys(capturedVars).join(', ')}`,
                    state: this.getCurrentState(),
                });
            }
        }

        this.addStep({
            stepNumber: this.stepNumber++,
            lineNumber,
            action: 'function_call',
            description: `Call ${funcName}(${args.join(', ')})`,
            state: this.getCurrentState(),
        });

        // Execute function body to track local variables and get return value
        const returnValue = this.executeFunctionBody(funcDef.node, args, funcDef.params);

        // Check if function creates an object
        const createsObject = this.functionCreatesObject(funcDef.node);

        if (createsObject && returnValue === undefined) {
            // Simulate object creation in function
            const heapId = `heap-${this.heap.length + 1}`;
            const address = `0x${Math.random().toString(16).substring(2, 8).toUpperCase()}`;

            const objectData = this.extractObjectDataFromFunction(funcDef.node, args, funcDef.params);

            const newHeapObject: HeapObject = {
                id: heapId,
                address,
                type: 'object',
                data: objectData,
                references: [],
                timestamp: Date.now(),
            };

            this.heap.push(newHeapObject);

            this.addStep({
                stepNumber: this.stepNumber++,
                lineNumber,
                action: 'object_creation',
                description: `Create object in heap at ${address}`,
                state: this.getCurrentState(),
            });
        }

        // Function return - pop stack
        this.stack.pop();
        this.recursionDepth--;

        const currentScope = this.getCurrentScope();
        const finalReturnValue = returnValue !== undefined
            ? returnValue
            : (createsObject ? this.heap[this.heap.length - 1]?.id : `result from ${funcName}`);

        // Store return value for this frame
        this.returnValues.set(frameId, finalReturnValue);

        // Skip adding internal variables to stack frame (they're implementation details)
        if (resultVarName.startsWith('__')) {
            return finalReturnValue;
        }

        const newVar: Variable = {
            name: resultVarName,
            value: finalReturnValue,
            type: createsObject ? 'object' : this.inferType(finalReturnValue),
            heapReference: createsObject ? this.heap[this.heap.length - 1]?.address : undefined,
            scope: currentScope,
        };

        if (currentScope === 'local' && this.stack.length > 0) {
            this.stack[this.stack.length - 1].variables.push(newVar);
        } else {
            this.globalVariables.push(newVar);
        }

        this.addStep({
            stepNumber: this.stepNumber++,
            lineNumber,
            action: 'function_return',
            description: `${funcName} returns ${finalReturnValue}, assign to ${resultVarName}`,
            state: this.getCurrentState(),
        });

        return finalReturnValue;
    }

    /**
     * Handle setTimeout - add to Web APIs, don't execute immediately
     */
    private handleSetTimeout(callExpr: t.CallExpression, resultVarName: string): number {
        const callback = callExpr.arguments[0];
        const delayArg = callExpr.arguments[1];

        // Evaluate delay (default 0)
        let delay = 0;
        if (delayArg && t.isNumericLiteral(delayArg)) {
            delay = delayArg.value;
        }

        // Convert delay to steps (1ms = 1 step for simplicity)
        const delaySteps = Math.max(1, Math.floor(delay / 100)); // 100ms per step

        const timerId = this.timerId++;
        const taskId = `timeout-${timerId}`;

        // Store callback for later execution
        this.pendingCallbacks.set(taskId, callback);

        // Add to Web APIs
        const webAPI: WebAPI = {
            id: taskId,
            type: 'timeout',
            description: `setTimeout(callback, ${delay}ms)`,
            startTime: this.stepNumber,
            duration: delaySteps,
            taskId,
        };

        this.webAPIs.push(webAPI);

        this.addStep({
            stepNumber: this.stepNumber++,
            lineNumber: 0,
            action: 'async_operation',
            description: `Register setTimeout (delay: ${delay}ms, ${delaySteps} steps)`,
            state: this.getCurrentState(),
        });

        return timerId;
    }

    /**
     * Handle object creation
     */
    private handleObjectCreation(varName: string, objExpr: t.ObjectExpression): void {
        const heapId = `heap-${this.heap.length + 1}`;
        const address = `0x${Math.random().toString(16).substring(2, 8).toUpperCase()}`;
        const lineNumber = objExpr.loc?.start.line || 0;

        const objectData: Record<string, any> = {};

        for (const prop of objExpr.properties) {
            if (t.isObjectProperty(prop) && t.isIdentifier(prop.key) && t.isExpression(prop.value)) {
                const key = prop.key.name;
                const value = this.evaluateExpression(prop.value);
                objectData[key] = value;
            }
        }

        const newHeapObject: HeapObject = {
            id: heapId,
            address,
            type: 'object',
            data: objectData,
            references: [],
            timestamp: Date.now(),
        };

        this.heap.push(newHeapObject);

        const currentScope = this.getCurrentScope();
        const newVar: Variable = {
            name: varName,
            value: heapId,
            type: 'object',
            heapReference: address,
            scope: currentScope,
        };

        if (currentScope === 'local' && this.stack.length > 0) {
            this.stack[this.stack.length - 1].variables.push(newVar);
        } else {
            this.globalVariables.push(newVar);
        }

        this.addStep({
            stepNumber: this.stepNumber++,
            lineNumber,
            action: 'object_creation',
            description: `Create object ${varName} in heap at ${address}`,
            state: this.getCurrentState(),
        });
    }

    /**
     * Handle array creation - store in heap
     */
    private handleArrayCreation(varName: string, arrExpr: t.ArrayExpression): void {
        const heapId = `heap-${this.heap.length + 1}`;
        const address = `0x${Math.random().toString(16).substring(2, 8).toUpperCase()}`;
        const lineNumber = arrExpr.loc?.start.line || 0;

        // Evaluate array elements
        const arrayData = arrExpr.elements.map(element => {
            if (element && (t.isExpression(element) || t.isSpreadElement(element))) {
                return this.evaluateExpression(element);
            }
            return null;
        }).filter(v => v !== null);

        const newHeapObject: HeapObject = {
            id: heapId,
            address,
            type: 'array',
            data: arrayData,
            references: [],
            timestamp: Date.now(),
        };

        this.heap.push(newHeapObject);

        const currentScope = this.getCurrentScope();
        const newVar: Variable = {
            name: varName,
            value: address,
            type: 'array',
            heapReference: address,
            scope: currentScope,
        };

        if (currentScope === 'local' && this.stack.length > 0) {
            this.stack[this.stack.length - 1].variables.push(newVar);
        } else {
            this.globalVariables.push(newVar);
        }

        this.addStep({
            stepNumber: this.stepNumber++,
            lineNumber,
            action: 'array_creation',
            description: `Create array ${varName} in heap at ${address}`,
            state: this.getCurrentState(),
        });
    }

    /**
     * Handle primitive variable assignment
     */
    private handlePrimitiveAssignment(varName: string, init: t.Expression): void {
        const value = this.evaluateExpression(init);
        const currentScope = this.getCurrentScope();
        const lineNumber = init.loc?.start.line || 0;

        const newVar: Variable = {
            name: varName,
            value,
            type: this.inferType(value),
            scope: currentScope,
        };

        if (currentScope === 'local' && this.stack.length > 0) {
            this.stack[this.stack.length - 1].variables.push(newVar);
        } else {
            this.globalVariables.push(newVar);
        }

        this.addStep({
            stepNumber: this.stepNumber++,
            lineNumber,
            action: 'variable_declaration',
            description: `Declare ${varName} = ${value}`,
            state: this.getCurrentState(),
        });
    }

    /**
     * Handle expression statement (like console.log)
     */
    private handleExpressionStatement(node: t.ExpressionStatement): void {
        const expr = node.expression;

        // Handle function calls like outer()
        if (t.isCallExpression(expr) && t.isIdentifier(expr.callee)) {
            const funcName = expr.callee.name;

            // Check if it's a known function
            if (this.functions.has(funcName)) {
                // Create a temporary variable name for the result
                const tempVarName = `__result_${this.stepNumber}`;

                // Execute the function call
                this.handleFunctionCall(tempVarName, expr);
                return;
            }
        }

        // Handle console.log
        if (t.isCallExpression(expr) &&
            t.isMemberExpression(expr.callee) &&
            t.isIdentifier(expr.callee.object) &&
            expr.callee.object.name === 'console' &&
            t.isIdentifier(expr.callee.property) &&
            expr.callee.property.name === 'log') {

            this.handleConsoleLog(expr);
        }
    }

    /**
     * Handle console.log
     */
    private handleConsoleLog(callExpr: t.CallExpression): void {
        const lineNumber = callExpr.loc?.start.line || 0;
        const arg = callExpr.arguments[0];

        if (!arg || !t.isExpression(arg)) {
            return;
        }

        let resolvedValue = this.evaluateExpression(arg);

        // Handle property access like person.name
        if (t.isMemberExpression(arg) &&
            t.isIdentifier(arg.object) &&
            t.isIdentifier(arg.property)) {

            const objName = arg.object.name;
            const propName = arg.property.name;

            const objVar = this.globalVariables.find(v => v.name === objName);
            if (objVar && objVar.heapReference) {
                const heapObj = this.heap.find(h => h.address === objVar.heapReference);
                if (heapObj && !Array.isArray(heapObj.data) && typeof heapObj.data === 'object') {
                    const objData = heapObj.data as Record<string, any>;
                    if (objData[propName]) {
                        resolvedValue = String(objData[propName]);
                    }
                }
            }
        }

        // Dereference heap address if needed
        if (typeof resolvedValue === 'string' && resolvedValue.startsWith('0x')) {
            const heapObj = this.heap.find(h => h.address === resolvedValue);
            if (heapObj) {
                resolvedValue = heapObj.data;
            }
        }

        // Format the value for display
        let displayValue: string;
        if (Array.isArray(resolvedValue)) {
            displayValue = JSON.stringify(resolvedValue);
        } else if (typeof resolvedValue === 'object' && resolvedValue !== null) {
            displayValue = JSON.stringify(resolvedValue);
        } else {
            displayValue = String(resolvedValue);
        }

        this.output.push(displayValue);

        this.addStep({
            stepNumber: this.stepNumber++,
            lineNumber,
            action: 'console_log',
            description: `Log: ${displayValue}`,
            state: this.getCurrentState(),
        });
    }

    /**
     * Evaluate an expression to get its value
     */
    private evaluateExpression(expr: t.Expression | t.SpreadElement | t.PrivateName): any {
        // Skip spread elements
        if (t.isSpreadElement(expr)) {
            return 'unknown';
        }

        // Skip private names (not supported in our simple execution engine)
        if (t.isPrivateName(expr)) {
            return 'unknown';
        }

        if (t.isStringLiteral(expr)) {
            return expr.value;
        } else if (t.isNumericLiteral(expr)) {
            return expr.value;
        } else if (t.isBooleanLiteral(expr)) {
            return expr.value;
        } else if (t.isIdentifier(expr)) {
            // Try to resolve variable - search through entire call stack for closure support
            // Start from current frame and go backwards through parent frames
            for (let i = this.stack.length - 1; i >= 0; i--) {
                const variable = this.stack[i].variables.find(v => v.name === expr.name);
                if (variable) {
                    return variable.value;
                }
            }

            // If not found in stack, check global variables
            const globalVar = this.globalVariables.find(v => v.name === expr.name);
            if (globalVar) {
                return globalVar.value;
            }

            // Not found anywhere, return the identifier name
            return expr.name;
        } else if (t.isBinaryExpression(expr) && expr.operator === '+') {
            const left = this.evaluateExpression(expr.left);
            const right = this.evaluateExpression(expr.right);
            return String(left) + String(right);
        } else if (t.isArrayExpression(expr)) {
            // Handle array literals like [1, 2, 3]
            return expr.elements.map(element => {
                if (element && (t.isExpression(element) || t.isSpreadElement(element))) {
                    return this.evaluateExpression(element);
                }
                return null;
            }).filter(v => v !== null);
        }

        return 'unknown';
    }

    /**
     * Execute function body to track local variables
     */
    private executeFunctionBody(
        funcNode: t.FunctionDeclaration,
        args: any[],
        params: string[]
    ): void {
        if (!funcNode.body || !t.isBlockStatement(funcNode.body)) return;

        // Create a parameter mapping for resolving parameter references
        const paramMap = new Map<string, any>();
        params.forEach((param, i) => {
            paramMap.set(param, args[i]);
        });

        // Execute each statement in the function body
        for (const statement of funcNode.body.body) {
            // Handle variable declarations inside the function
            if (t.isVariableDeclaration(statement)) {
                for (const declarator of statement.declarations) {
                    if (!t.isIdentifier(declarator.id)) continue;

                    const varName = declarator.id.name;
                    const init = declarator.init;

                    if (!init) continue;

                    const lineNumber = statement.loc?.start.line || 0;

                    // Check if it's an object expression
                    if (t.isObjectExpression(init)) {
                        // Create object in heap
                        const heapId = `heap-${this.heap.length + 1}`;
                        const address = `0x${Math.random().toString(16).substring(2, 8).toUpperCase()}`;

                        const objectData: Record<string, any> = {};

                        // Extract object properties
                        for (const prop of init.properties) {
                            if (t.isObjectProperty(prop) && t.isIdentifier(prop.key)) {
                                const key = prop.key.name;
                                let propValue: any;

                                if (t.isExpression(prop.value)) {
                                    propValue = this.evaluateExpressionInContext(prop.value, paramMap);
                                } else {
                                    propValue = 'unknown';
                                }

                                objectData[key] = propValue;
                            }
                        }

                        const newHeapObject: HeapObject = {
                            id: heapId,
                            address,
                            type: 'object',
                            data: objectData,
                            references: [],
                            timestamp: Date.now(),
                        };

                        this.heap.push(newHeapObject);

                        // Add variable to current stack frame with heap reference
                        if (this.stack.length > 0) {
                            const currentFrame = this.stack[this.stack.length - 1];
                            currentFrame.variables.push({
                                name: varName,
                                value: address,
                                type: 'object',
                                heapReference: address,
                                scope: 'local',
                            });

                            this.addStep({
                                stepNumber: this.stepNumber++,
                                lineNumber,
                                action: 'object_creation',
                                description: `Create object ${varName} in heap at ${address}`,
                                state: this.getCurrentState(),
                            });
                        }
                    }
                    // Handle array expressions - store in heap
                    else if (t.isArrayExpression(init)) {
                        const heapId = `heap-${this.heap.length + 1}`;
                        const address = `0x${Math.random().toString(16).substring(2, 8).toUpperCase()}`;

                        // Evaluate array elements
                        const arrayData = init.elements.map(element => {
                            if (element && (t.isExpression(element) || t.isSpreadElement(element))) {
                                return this.evaluateExpressionInContext(element, paramMap);
                            }
                            return null;
                        }).filter(v => v !== null);

                        const newHeapObject: HeapObject = {
                            id: heapId,
                            address,
                            type: 'array',
                            data: arrayData,
                            references: [],
                            timestamp: Date.now(),
                        };

                        this.heap.push(newHeapObject);

                        // Add variable to current stack frame with heap reference
                        if (this.stack.length > 0) {
                            const currentFrame = this.stack[this.stack.length - 1];
                            currentFrame.variables.push({
                                name: varName,
                                value: address,
                                type: 'array',
                                heapReference: address,
                                scope: 'local',
                            });

                            this.addStep({
                                stepNumber: this.stepNumber++,
                                lineNumber,
                                action: 'array_creation',
                                description: `Create array ${varName} in heap at ${address}`,
                                state: this.getCurrentState(),
                            });
                        }
                    }
                    // Handle primitive values and expressions
                    else {
                        // Evaluate the initializer, resolving parameter references
                        let value: any;
                        if (t.isBinaryExpression(init) && init.operator === '+') {
                            const left = this.evaluateExpressionInContext(init.left, paramMap);
                            const right = this.evaluateExpressionInContext(init.right, paramMap);
                            value = String(left) + String(right);
                        } else {
                            value = this.evaluateExpressionInContext(init, paramMap);
                        }

                        // Add variable to current stack frame
                        if (this.stack.length > 0) {
                            const currentFrame = this.stack[this.stack.length - 1];
                            currentFrame.variables.push({
                                name: varName,
                                value,
                                type: this.inferType(value),
                                scope: 'local',
                            });

                            this.addStep({
                                stepNumber: this.stepNumber++,
                                lineNumber,
                                action: 'variable_declaration',
                                description: `Declare ${varName} = ${value}`,
                                state: this.getCurrentState(),
                            });
                        }
                    }
                }
            }
            // Handle for loops
            else if (t.isForStatement(statement)) {
                const lineNumber = statement.loc?.start.line || 0;

                // Initialize loop variable
                if (statement.init && t.isVariableDeclaration(statement.init)) {
                    for (const declarator of statement.init.declarations) {
                        if (t.isIdentifier(declarator.id) && declarator.init) {
                            const varName = declarator.id.name;
                            const initValue = this.evaluateExpressionInContext(declarator.init, paramMap);
                            paramMap.set(varName, initValue);

                            this.addStep({
                                stepNumber: this.stepNumber++,
                                lineNumber,
                                action: 'variable_declaration',
                                description: `Initialize ${varName} = ${initValue}`,
                                state: this.getCurrentState(),
                            });
                        }
                    }
                }

                // Execute loop iterations
                let iterationCount = 0;
                const maxIterations = 1000; // Prevent infinite loops

                while (iterationCount < maxIterations) {
                    // Evaluate condition
                    if (statement.test) {
                        const condition = this.evaluateExpressionInContext(statement.test, paramMap);

                        if (!condition) {
                            break; // Exit loop if condition is false
                        }
                    }

                    // Execute loop body
                    if (t.isBlockStatement(statement.body)) {
                        for (const bodyStmt of statement.body.body) {
                            // Handle assignment expressions like doubled[i] = arr[i] * 2
                            if (t.isExpressionStatement(bodyStmt) && t.isAssignmentExpression(bodyStmt.expression)) {
                                const assignment = bodyStmt.expression;

                                // Handle array element assignment: arr[index] = value
                                if (t.isMemberExpression(assignment.left) && assignment.left.computed) {
                                    const objName = t.isIdentifier(assignment.left.object) ? assignment.left.object.name : null;
                                    const index = this.evaluateExpressionInContext(assignment.left.property, paramMap);
                                    const value = this.evaluateExpressionInContext(assignment.right, paramMap);

                                    if (objName && this.stack.length > 0) {
                                        const currentFrame = this.stack[this.stack.length - 1];
                                        const arrayVar = currentFrame.variables.find(v => v.name === objName);

                                        if (arrayVar) {
                                            // Check if it's a heap reference
                                            if (typeof arrayVar.value === 'string' && arrayVar.value.startsWith('0x')) {
                                                const heapObj = this.heap.find(h => h.address === arrayVar.value);
                                                if (heapObj && Array.isArray(heapObj.data)) {
                                                    heapObj.data[index] = value;

                                                    this.addStep({
                                                        stepNumber: this.stepNumber++,
                                                        lineNumber: bodyStmt.loc?.start.line || 0,
                                                        action: 'variable_assignment',
                                                        description: `${objName}[${index}] = ${value}`,
                                                        state: this.getCurrentState(),
                                                    });
                                                }
                                            }
                                            // Fallback for direct array values (shouldn't happen with heap storage)
                                            else if (Array.isArray(arrayVar.value)) {
                                                arrayVar.value[index] = value;

                                                this.addStep({
                                                    stepNumber: this.stepNumber++,
                                                    lineNumber: bodyStmt.loc?.start.line || 0,
                                                    action: 'variable_assignment',
                                                    description: `${objName}[${index}] = ${value}`,
                                                    state: this.getCurrentState(),
                                                });
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }

                    // Update loop variable (i++)
                    if (statement.update) {
                        if (t.isUpdateExpression(statement.update) && t.isIdentifier(statement.update.argument)) {
                            const varName = statement.update.argument.name;
                            const currentValue = paramMap.get(varName) || 0;

                            if (statement.update.operator === '++') {
                                paramMap.set(varName, currentValue + 1);
                            } else if (statement.update.operator === '--') {
                                paramMap.set(varName, currentValue - 1);
                            }
                        }
                    }

                    iterationCount++;
                }

                if (iterationCount >= maxIterations) {
                    console.warn('Max loop iterations exceeded');
                }
            }
            // Handle if statements (for base cases in recursion)
            else if (t.isIfStatement(statement)) {
                const test = statement.test;
                const lineNumber = statement.loc?.start.line || 0;

                // Evaluate the condition
                const condition = this.evaluateExpressionInContext(test, paramMap);

                this.addStep({
                    stepNumber: this.stepNumber++,
                    lineNumber,
                    action: 'expression_evaluation',
                    description: `Evaluate condition: ${condition}`,
                    state: this.getCurrentState(),
                });

                // Execute consequent or alternate based on condition
                if (condition) {
                    // Execute the if block
                    if (t.isBlockStatement(statement.consequent)) {
                        for (const stmt of statement.consequent.body) {
                            if (t.isReturnStatement(stmt)) {
                                // Handle return in if block
                                const returnArg = stmt.argument;
                                if (returnArg) {
                                    const returnValue = this.evaluateExpressionInContext(returnArg, paramMap);
                                    const returnLineNumber = stmt.loc?.start.line || 0;

                                    this.addStep({
                                        stepNumber: this.stepNumber++,
                                        lineNumber: returnLineNumber,
                                        action: 'expression_evaluation',
                                        description: `Return ${returnValue}`,
                                        state: this.getCurrentState(),
                                    });

                                    return returnValue;
                                }
                            }
                        }
                    } else if (t.isReturnStatement(statement.consequent)) {
                        // Single return statement without block
                        const returnArg = statement.consequent.argument;
                        if (returnArg) {
                            const returnValue = this.evaluateExpressionInContext(returnArg, paramMap);
                            const returnLineNumber = statement.consequent.loc?.start.line || 0;

                            this.addStep({
                                stepNumber: this.stepNumber++,
                                lineNumber: returnLineNumber,
                                action: 'expression_evaluation',
                                description: `Return ${returnValue}`,
                                state: this.getCurrentState(),
                            });

                            return returnValue;
                        }
                    }
                } else if (statement.alternate) {
                    // Execute the else block if condition is false
                    if (t.isBlockStatement(statement.alternate)) {
                        for (const stmt of statement.alternate.body) {
                            if (t.isReturnStatement(stmt)) {
                                const returnArg = stmt.argument;
                                if (returnArg) {
                                    const returnValue = this.evaluateExpressionInContext(returnArg, paramMap);
                                    const returnLineNumber = stmt.loc?.start.line || 0;

                                    this.addStep({
                                        stepNumber: this.stepNumber++,
                                        lineNumber: returnLineNumber,
                                        action: 'expression_evaluation',
                                        description: `Return ${returnValue}`,
                                        state: this.getCurrentState(),
                                    });

                                    return returnValue;
                                }
                            }
                        }
                    }
                }
            }
            // Handle expression statements (like function calls: inner())
            else if (t.isExpressionStatement(statement)) {
                const expr = statement.expression;

                // Handle function calls
                if (t.isCallExpression(expr) && t.isIdentifier(expr.callee)) {
                    const funcName = expr.callee.name;

                    // Check if it's a known function
                    if (this.functions.has(funcName)) {
                        // Evaluate arguments with current parameter context
                        const evaluatedArgs = expr.arguments.map(arg => {
                            if (t.isExpression(arg) || t.isSpreadElement(arg)) {
                                return this.evaluateExpressionInContext(arg, paramMap);
                            }
                            return 'unknown';
                        });

                        // Create a temporary variable name for the call result
                        const tempVarName = `__result_${this.stepNumber}`;

                        // Execute the function call
                        this.handleFunctionCall(tempVarName, expr, evaluatedArgs);
                    }
                }
                // Handle assignment expressions (count = count + 1)
                else if (t.isAssignmentExpression(expr)) {
                    const assignment = expr;

                    // Only handle simple identifier assignments for now
                    if (t.isIdentifier(assignment.left)) {
                        const varName = assignment.left.name;
                        const value = this.evaluateExpressionInContext(assignment.right, paramMap);
                        const lineNumber = statement.loc?.start.line || 0;

                        // Search for variable in call stack (for closure support)
                        let found = false;
                        for (let i = this.stack.length - 1; i >= 0; i--) {
                            const frame = this.stack[i];
                            const variable = frame.variables.find(v => v.name === varName);

                            if (variable) {
                                // Update existing variable in outer scope
                                variable.value = value;
                                variable.type = this.inferType(value);
                                found = true;

                                this.addStep({
                                    stepNumber: this.stepNumber++,
                                    lineNumber,
                                    action: 'variable_assignment',
                                    description: `Update ${varName} = ${value}`,
                                    state: this.getCurrentState(),
                                });
                                break;
                            }
                        }

                        // If not found in stack, check global variables
                        if (!found) {
                            const globalVar = this.globalVariables.find(v => v.name === varName);
                            if (globalVar) {
                                globalVar.value = value;
                                globalVar.type = this.inferType(value);

                                this.addStep({
                                    stepNumber: this.stepNumber++,
                                    lineNumber,
                                    action: 'variable_assignment',
                                    description: `Update ${varName} = ${value}`,
                                    state: this.getCurrentState(),
                                });
                            }
                        }
                    }
                }
                // Handle console.log with member expression
                else if (t.isCallExpression(expr) &&
                    t.isMemberExpression(expr.callee) &&
                    t.isIdentifier(expr.callee.object) &&
                    t.isIdentifier(expr.callee.property) &&
                    expr.callee.object.name === 'console' &&
                    expr.callee.property.name === 'log') {
                    this.handleConsoleLog(expr);
                }
            }
            // Handle return statements
            else if (t.isReturnStatement(statement)) {
                const lineNumber = statement.loc?.start.line || 0;
                const argument = statement.argument;

                if (!argument) {
                    this.addStep({
                        stepNumber: this.stepNumber++,
                        lineNumber,
                        action: 'expression_evaluation',
                        description: 'Return undefined',
                        state: this.getCurrentState(),
                    });
                    return undefined;
                }

                // Detect function calls in return expression
                const functionCalls = this.detectFunctionCallsInExpression(argument);

                // If there are recursive calls, execute them first
                if (functionCalls.length > 0) {
                    for (const call of functionCalls) {
                        if (t.isIdentifier(call.callee)) {
                            const funcName = call.callee.name;
                            // Check if it's a recursive call
                            if (this.functions.has(funcName)) {
                                // Evaluate arguments with current parameter context
                                const evaluatedArgs = call.arguments.map(arg => {
                                    if (t.isExpression(arg) || t.isSpreadElement(arg)) {
                                        return this.evaluateExpressionInContext(arg, paramMap);
                                    }
                                    return 'unknown';
                                });

                                // Create a temporary variable name for the recursive call result
                                const tempVarName = `__temp_${this.stepNumber}`;

                                // Execute the recursive call with pre-evaluated arguments
                                const recursiveResult = this.handleFunctionCall(tempVarName, call, evaluatedArgs);

                                // Store result in paramMap so it can be used in expression evaluation
                                paramMap.set(tempVarName, recursiveResult);
                            }
                        }
                    }
                }

                // Evaluate the return expression
                let returnValue: any;
                if (t.isBinaryExpression(argument)) {
                    // Handle binary expressions like n * factorial(n-1)
                    const left = this.evaluateExpressionWithCalls(argument.left, paramMap);
                    const right = this.evaluateExpressionWithCalls(argument.right, paramMap);

                    if (argument.operator === '*') {
                        returnValue = Number(left) * Number(right);
                    } else if (argument.operator === '+') {
                        returnValue = Number(left) + Number(right);
                    } else if (argument.operator === '-') {
                        returnValue = Number(left) - Number(right);
                    } else if (argument.operator === '/') {
                        returnValue = Number(left) / Number(right);
                    } else {
                        returnValue = String(left) + String(right);
                    }
                } else {
                    returnValue = this.evaluateExpressionInContext(argument, paramMap);
                }

                this.addStep({
                    stepNumber: this.stepNumber++,
                    lineNumber,
                    action: 'expression_evaluation',
                    description: `Return ${returnValue}`,
                    state: this.getCurrentState(),
                });

                return returnValue;
            }
        }

        return undefined;
    }

    /**
     * Evaluate expression that may contain function call results
     */
    private evaluateExpressionWithCalls(
        expr: t.Expression | t.SpreadElement | t.PrivateName,
        paramMap: Map<string, any>
    ): any {
        if (t.isSpreadElement(expr) || t.isPrivateName(expr)) {
            return 'unknown';
        }

        if (t.isCallExpression(expr) && t.isIdentifier(expr.callee)) {
            // This is a function call - check if we already computed its result
            const funcName = expr.callee.name;
            // Look for temp variable in paramMap
            for (const [key, value] of paramMap.entries()) {
                if (key.startsWith('__temp_')) {
                    return value;
                }
            }
        }

        return this.evaluateExpressionInContext(expr, paramMap);
    }

    /**
     * Detect function calls within an expression
     */
    private detectFunctionCallsInExpression(expr: t.Expression | t.SpreadElement | t.PrivateName): t.CallExpression[] {
        const calls: t.CallExpression[] = [];

        if (t.isSpreadElement(expr) || t.isPrivateName(expr)) {
            return calls;
        }

        if (t.isCallExpression(expr)) {
            calls.push(expr);
        } else if (t.isBinaryExpression(expr)) {
            calls.push(...this.detectFunctionCallsInExpression(expr.left));
            calls.push(...this.detectFunctionCallsInExpression(expr.right));
        }

        return calls;
    }

    /**
     * Evaluate expression with parameter context
     */
    private evaluateExpressionInContext(
        expr: t.Expression | t.SpreadElement | t.PrivateName,
        paramMap: Map<string, any>
    ): any {
        if (t.isSpreadElement(expr) || t.isPrivateName(expr)) {
            return 'unknown';
        }

        if (t.isStringLiteral(expr)) {
            return expr.value;
        } else if (t.isNumericLiteral(expr)) {
            return expr.value;
        } else if (t.isBooleanLiteral(expr)) {
            return expr.value;
        } else if (t.isIdentifier(expr)) {
            // Check if it's a parameter first
            if (paramMap.has(expr.name)) {
                return paramMap.get(expr.name);
            }

            // Search through entire call stack for closure support
            for (let i = this.stack.length - 1; i >= 0; i--) {
                const variable = this.stack[i].variables.find(v => v.name === expr.name);
                if (variable) {
                    return variable.value;
                }
            }

            // Check global variables
            const globalVar = this.globalVariables.find(v => v.name === expr.name);
            if (globalVar) {
                return globalVar.value;
            }

            return expr.name;
        } else if (t.isBinaryExpression(expr)) {
            // Handle binary expressions like n - 1, n + 1, etc.
            const left = this.evaluateExpressionInContext(expr.left, paramMap);
            const right = this.evaluateExpressionInContext(expr.right, paramMap);

            const leftNum = Number(left);
            const rightNum = Number(right);

            switch (expr.operator) {
                case '+':
                    return leftNum + rightNum;
                case '-':
                    return leftNum - rightNum;
                case '*':
                    return leftNum * rightNum;
                case '/':
                    return leftNum / rightNum;
                case '%':
                    return leftNum % rightNum;
                case '<=':
                    return leftNum <= rightNum;
                case '>=':
                    return leftNum >= rightNum;
                case '<':
                    return leftNum < rightNum;
                case '>':
                    return leftNum > rightNum;
                case '==':
                case '===':
                    return left === right;
                case '!=':
                case '!==':
                    return left !== right;
                default:
                    return 'unknown';
            }
        } else if (t.isMemberExpression(expr)) {
            // Handle member expressions like arr.length, obj.property
            let object = this.evaluateExpressionInContext(expr.object, paramMap);

            // Dereference heap address if needed
            if (typeof object === 'string' && object.startsWith('0x')) {
                const heapObj = this.heap.find(h => h.address === object);
                if (heapObj) {
                    object = heapObj.data;
                }
            }

            if (expr.computed) {
                // Computed property: arr[i]
                const property = this.evaluateExpressionInContext(expr.property, paramMap);
                if (Array.isArray(object) || typeof object === 'object') {
                    return object[property];
                }
            } else {
                // Static property: arr.length
                const propertyName = t.isIdentifier(expr.property) ? expr.property.name : null;
                if (propertyName) {
                    if (Array.isArray(object) && propertyName === 'length') {
                        return object.length;
                    }
                    if (typeof object === 'object' && object !== null) {
                        return object[propertyName];
                    }
                }
            }
            return 'unknown';
        } else if (t.isArrayExpression(expr)) {
            // Handle array literals like [1, 2, 3]
            return expr.elements.map(element => {
                if (element && (t.isExpression(element) || t.isSpreadElement(element))) {
                    return this.evaluateExpressionInContext(element, paramMap);
                }
                return null;
            }).filter(v => v !== null);
        }

        return 'unknown';
    }

    /**
     * Check if function creates an object
     */
    private functionCreatesObject(funcNode: t.FunctionDeclaration): boolean {
        let createsObject = false;

        traverse(t.file(t.program([funcNode])), {
            ObjectExpression: () => {
                createsObject = true;
            }
        }, undefined, {});

        return createsObject;
    }

    /**
     * Extract object data from function body
     */
    private extractObjectDataFromFunction(
        funcNode: t.FunctionDeclaration,
        args: any[],
        params: string[]
    ): Record<string, any> {
        const objectData: Record<string, any> = {};

        traverse(t.file(t.program([funcNode])), {
            ObjectExpression: (path: any) => {
                for (const prop of path.node.properties) {
                    if (t.isObjectProperty(prop) && t.isIdentifier(prop.key)) {
                        const key = prop.key.name;

                        if (t.isIdentifier(prop.value)) {
                            const paramIndex = params.indexOf(prop.value.name);
                            objectData[key] = paramIndex >= 0 ? args[paramIndex] : prop.value.name;
                        } else if (t.isExpression(prop.value)) {
                            objectData[key] = this.evaluateExpression(prop.value);
                        }
                    }
                }
            }
        }, undefined, {});

        return objectData;
    }

    /**
     * Infer variable type from value
     */
    private inferType(value: any): VariableType {
        if (typeof value === 'string') return 'string';
        if (typeof value === 'number') return 'number';
        if (typeof value === 'boolean') return 'boolean';
        if (value === null) return 'null';
        if (value === undefined) return 'undefined';
        if (Array.isArray(value)) return 'array';
        if (typeof value === 'object') return 'object';
        return 'string';
    }

    /**
     * Get current scope (global or local)
     */
    private getCurrentScope(): 'global' | 'local' {
        return this.stack.length > 0 ? 'local' : 'global';
    }

    /**
     * Get current execution state
     */
    private getCurrentState(): ExecutionState {
        return {
            currentLine: 0,
            stack: JSON.parse(JSON.stringify(this.stack)),
            heap: JSON.parse(JSON.stringify(this.heap)),
            globalVariables: JSON.parse(JSON.stringify(this.globalVariables)),
            output: [...this.output],
            isComplete: false,
            // Event Loop state
            taskQueue: JSON.parse(JSON.stringify(this.taskQueue)),
            microtaskQueue: JSON.parse(JSON.stringify(this.microtaskQueue)),
            webAPIs: JSON.parse(JSON.stringify(this.webAPIs)),
            eventLoopPhase: this.currentPhase,
        };
    }

    /**
     * Add execution step
     */
    /**
     * Process Event Loop - check timers and execute tasks
     */
    private processEventLoop(): void {
        // 1. Check Web APIs for expired timers
        const expiredAPIs: WebAPI[] = [];

        this.webAPIs = this.webAPIs.filter(api => {
            if (api.type === 'timeout') {
                const elapsed = this.stepNumber - api.startTime;
                if (elapsed >= (api.duration || 0)) {
                    expiredAPIs.push(api);
                    return false; // Remove from Web APIs
                }
            }
            return true; // Keep in Web APIs
        });

        // 2. Move expired timers to Task Queue
        expiredAPIs.forEach(api => {
            const callback = this.pendingCallbacks.get(api.taskId!);
            if (callback) {
                const task: Task = {
                    id: api.taskId!,
                    type: 'macrotask',
                    description: `setTimeout callback`,
                    callback: 'stored_callback',
                    timestamp: this.stepNumber,
                };

                this.taskQueue.push(task);

                this.addStep({
                    stepNumber: this.stepNumber++,
                    lineNumber: 0,
                    action: 'async_operation',
                    description: `Move ${api.description} to Task Queue`,
                    state: this.getCurrentState(),
                });
            }
        });

        // 3. Execute microtasks (if any) - not implemented yet
        // while (this.microtaskQueue.length > 0) { ... }

        // 4. Execute one macrotask if call stack is empty
        if (this.stack.length === 0 && this.taskQueue.length > 0) {
            this.currentPhase = 'tasks';
            const task = this.taskQueue.shift()!;
            this.executeTask(task);
        } else if (this.stack.length === 0) {
            this.currentPhase = 'idle';
        } else {
            this.currentPhase = 'stack';
        }
    }

    /**
     * Execute a task from the task queue
     */
    private executeTask(task: Task): void {
        const callback = this.pendingCallbacks.get(task.id);
        if (!callback) return;

        this.addStep({
            stepNumber: this.stepNumber++,
            lineNumber: 0,
            action: 'task_execution',
            description: `Execute task: ${task.description}`,
            state: this.getCurrentState(),
        });

        // Execute callback
        if (t.isArrowFunctionExpression(callback) || t.isFunctionExpression(callback)) {
            // Execute callback body
            if (t.isBlockStatement(callback.body)) {
                // Execute each statement in callback
                for (const stmt of callback.body.body) {
                    if (t.isExpressionStatement(stmt)) {
                        this.evaluateExpression(stmt.expression);
                    } else if (t.isVariableDeclaration(stmt)) {
                        // Handle variable declarations in callback
                        for (const decl of stmt.declarations) {
                            if (t.isIdentifier(decl.id) && decl.init) {
                                const value = this.evaluateExpression(decl.init);
                                // Add to global scope for now
                                this.globalVariables.push({
                                    name: decl.id.name,
                                    value,
                                    type: this.inferType(value),
                                    scope: 'global',
                                });
                            }
                        }
                    }
                }
            } else {
                // Arrow function with expression body
                this.evaluateExpression(callback.body);
            }
        }

        // Clean up
        this.pendingCallbacks.delete(task.id);
    }

    /**
     * Add execution step
     */
    private addStep(step: ExecutionStep): void {
        this.steps.push(step);
    }

    /**
     * Get last line number from AST
     */
    private getLastLineNumber(): number {
        if (!this.ast) return 0;
        const lastStatement = this.ast.program.body[this.ast.program.body.length - 1];
        return lastStatement?.loc?.end.line || 0;
    }

    // Public API methods (same as original engine)

    getSteps(): ExecutionStep[] {
        return this.steps;
    }

    getCurrentStep(): ExecutionStep | null {
        return this.steps[this.currentStepIndex] || null;
    }

    getStep(index: number): ExecutionStep | null {
        return this.steps[index] || null;
    }

    getTotalSteps(): number {
        return this.steps.length;
    }

    nextStep(): ExecutionStep | null {
        if (this.currentStepIndex < this.steps.length - 1) {
            this.currentStepIndex++;
            return this.getCurrentStep();
        }
        return null;
    }

    previousStep(): ExecutionStep | null {
        if (this.currentStepIndex > 0) {
            this.currentStepIndex--;
            return this.getCurrentStep();
        }
        return null;
    }

    reset(): void {
        this.currentStepIndex = 0;
    }

    goToStep(index: number): ExecutionStep | null {
        if (index >= 0 && index < this.steps.length) {
            this.currentStepIndex = index;
            return this.getCurrentStep();
        }
        return null;
    }

    getCurrentStepIndex(): number {
        return this.currentStepIndex;
    }
}
