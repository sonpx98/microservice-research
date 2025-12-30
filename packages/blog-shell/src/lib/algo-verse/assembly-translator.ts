/**
 * Assembly Translator
 * Converts JavaScript code to simplified pseudo-assembly instructions
 */

import { AssemblyInstruction } from './types';

let registerCounter = 0;
let labelCounter = 0;

/**
 * Reset counters for new translation
 */
function resetCounters() {
    registerCounter = 0;
    labelCounter = 0;
}

/**
 * Get next available register
 */
function getNextRegister(): string {
    const reg = `R${registerCounter % 4}`;
    registerCounter++;
    return reg;
}

/**
 * Get next label
 */
function getNextLabel(prefix: string = 'L'): string {
    return `${prefix}${labelCounter++}`;
}

/**
 * Translate variable declaration
 */
function translateVariableDeclaration(
    line: string,
    lineNumber: number,
    asmLineNumber: number
): AssemblyInstruction[] {
    const instructions: AssemblyInstruction[] = [];

    // Match: const/let/var name = value
    const match = line.match(/(const|let|var)\s+(\w+)\s*=\s*(.+);?/);
    if (!match) return instructions;

    const [, , varName, value] = match;
    const reg = getNextRegister();

    // Check if value is a literal number
    if (/^\d+$/.test(value.trim())) {
        instructions.push({
            lineNumber: asmLineNumber,
            instruction: 'LOAD',
            operands: [reg, `#${value.trim()}`],
            sourceLineNumber: lineNumber,
            isActive: false,
        });
    }
    // Check if value is a string
    else if (value.trim().startsWith('"') || value.trim().startsWith("'")) {
        instructions.push({
            lineNumber: asmLineNumber,
            instruction: 'LOAD',
            operands: [reg, value.trim()],
            sourceLineNumber: lineNumber,
            isActive: false,
        });
    }
    // Check if it's an object literal
    else if (value.trim().startsWith('{')) {
        instructions.push({
            lineNumber: asmLineNumber,
            instruction: 'ALLOC',
            operands: [reg, 'OBJECT'],
            sourceLineNumber: lineNumber,
            isActive: false,
        });
    }
    // Check if it's an array literal
    else if (value.trim().startsWith('[')) {
        instructions.push({
            lineNumber: asmLineNumber,
            instruction: 'ALLOC',
            operands: [reg, 'ARRAY'],
            sourceLineNumber: lineNumber,
            isActive: false,
        });
    }
    // Otherwise it's a variable reference or expression
    else {
        instructions.push({
            lineNumber: asmLineNumber,
            instruction: 'LOAD',
            operands: [reg, `[${value.trim()}]`],
            sourceLineNumber: lineNumber,
            isActive: false,
        });
    }

    // Store to memory location
    instructions.push({
        lineNumber: asmLineNumber + 1,
        instruction: 'STORE',
        operands: [reg, `[${varName}]`],
        sourceLineNumber: lineNumber,
        isActive: false,
    });

    return instructions;
}

/**
 * Translate arithmetic operation
 */
function translateArithmetic(
    line: string,
    lineNumber: number,
    asmLineNumber: number
): AssemblyInstruction[] {
    const instructions: AssemblyInstruction[] = [];

    // Match: x + y, x - y, x * y, x / y
    const match = line.match(/(\w+)\s*([+\-*/])\s*(\w+)/);
    if (!match) return instructions;

    const [, left, op, right] = match;
    const reg1 = getNextRegister();
    const reg2 = getNextRegister();

    // Load operands
    instructions.push({
        lineNumber: asmLineNumber,
        instruction: 'LOAD',
        operands: [reg1, `[${left}]`],
        sourceLineNumber: lineNumber,
        isActive: false,
    });

    instructions.push({
        lineNumber: asmLineNumber + 1,
        instruction: 'LOAD',
        operands: [reg2, `[${right}]`],
        sourceLineNumber: lineNumber,
        isActive: false,
    });

    // Perform operation
    const opMap: Record<string, string> = {
        '+': 'ADD',
        '-': 'SUB',
        '*': 'MUL',
        '/': 'DIV',
    };

    instructions.push({
        lineNumber: asmLineNumber + 2,
        instruction: opMap[op] || 'ADD',
        operands: [reg1, reg2],
        sourceLineNumber: lineNumber,
        isActive: false,
    });

    return instructions;
}

/**
 * Translate function call
 */
function translateFunctionCall(
    line: string,
    lineNumber: number,
    asmLineNumber: number
): AssemblyInstruction[] {
    const instructions: AssemblyInstruction[] = [];

    // Match: functionName(args)
    const match = line.match(/(\w+)\s*\((.*?)\)/);
    if (!match) return instructions;

    const [, funcName, args] = match;

    // Push arguments (simplified - just count them)
    const argList = args.split(',').filter(a => a.trim());
    argList.forEach((arg, index) => {
        const reg = getNextRegister();
        instructions.push({
            lineNumber: asmLineNumber + index,
            instruction: 'LOAD',
            operands: [reg, arg.trim().startsWith('#') ? arg.trim() : `[${arg.trim()}]`],
            sourceLineNumber: lineNumber,
            isActive: false,
        });
        instructions.push({
            lineNumber: asmLineNumber + index + 1,
            instruction: 'PUSH',
            operands: [reg],
            sourceLineNumber: lineNumber,
            isActive: false,
        });
    });

    // Call function
    instructions.push({
        lineNumber: asmLineNumber + argList.length * 2,
        instruction: 'CALL',
        operands: [funcName],
        sourceLineNumber: lineNumber,
        isActive: false,
    });

    return instructions;
}

/**
 * Translate return statement
 */
function translateReturn(
    line: string,
    lineNumber: number,
    asmLineNumber: number
): AssemblyInstruction[] {
    const instructions: AssemblyInstruction[] = [];

    const match = line.match(/return\s+(.+);?/);
    if (!match) {
        // Simple return
        instructions.push({
            lineNumber: asmLineNumber,
            instruction: 'RET',
            operands: [],
            sourceLineNumber: lineNumber,
            isActive: false,
        });
        return instructions;
    }

    const [, value] = match;
    const reg = getNextRegister();

    // Load return value
    instructions.push({
        lineNumber: asmLineNumber,
        instruction: 'LOAD',
        operands: [reg, /^\d+$/.test(value.trim()) ? `#${value.trim()}` : `[${value.trim()}]`],
        sourceLineNumber: lineNumber,
        isActive: false,
    });

    // Return
    instructions.push({
        lineNumber: asmLineNumber + 1,
        instruction: 'RET',
        operands: [reg],
        sourceLineNumber: lineNumber,
        isActive: false,
    });

    return instructions;
}

/**
 * Main translation function
 */
export function generateAssemblyCode(jsCode: string): AssemblyInstruction[] {
    resetCounters();
    const lines = jsCode.split('\n');
    const instructions: AssemblyInstruction[] = [];
    let asmLineNumber = 0;

    lines.forEach((line, index) => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('/*')) {
            return; // Skip empty lines and comments
        }

        let lineInstructions: AssemblyInstruction[] = [];

        // Function declaration
        if (trimmed.startsWith('function')) {
            const match = trimmed.match(/function\s+(\w+)/);
            if (match) {
                lineInstructions.push({
                    lineNumber: asmLineNumber++,
                    instruction: 'LABEL',
                    operands: [match[1]],
                    sourceLineNumber: index + 1,
                    isActive: false,
                });
            }
        }
        // Variable declaration
        else if (trimmed.match(/^(const|let|var)\s+/)) {
            lineInstructions = translateVariableDeclaration(trimmed, index + 1, asmLineNumber);
            asmLineNumber += lineInstructions.length;
        }
        // Return statement
        else if (trimmed.startsWith('return')) {
            lineInstructions = translateReturn(trimmed, index + 1, asmLineNumber);
            asmLineNumber += lineInstructions.length;
        }
        // Function call
        else if (trimmed.match(/\w+\s*\(/)) {
            lineInstructions = translateFunctionCall(trimmed, index + 1, asmLineNumber);
            asmLineNumber += lineInstructions.length;
        }
        // Closing brace
        else if (trimmed === '}') {
            // Check if this closes a function
            lineInstructions.push({
                lineNumber: asmLineNumber++,
                instruction: 'RET',
                operands: [],
                sourceLineNumber: index + 1,
                isActive: false,
            });
        }

        instructions.push(...lineInstructions);
    });

    return instructions;
}

/**
 * Get assembly instruction at specific source line
 */
export function getAssemblyAtLine(
    assemblyCode: AssemblyInstruction[],
    sourceLineNumber: number
): AssemblyInstruction[] {
    return assemblyCode.filter(inst => inst.sourceLineNumber === sourceLineNumber);
}
