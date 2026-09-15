/**
 * CPU State Generator
 * Generates CPU register states based on assembly instructions and execution steps
 */

import { CPUState, CPURegisters, AssemblyInstruction, ActionType } from './types';
import { getAssemblyAtLine } from './assembly-translator';

/**
 * Create initial CPU state
 */
export function createInitialCPUState(assemblyCode: AssemblyInstruction[]): CPUState {
    return {
        registers: {
            pc: 0,
            ir: 'NOP',
            acc: 0,
            r0: 0,
            r1: 0,
            r2: 0,
            r3: 0,
        },
        pipeline: [],
        assemblyCode,
        cycleCount: 0,
    };
}

/**
 * Update CPU state based on current execution step
 */
export function updateCPUState(
    prevState: CPUState,
    currentLine: number,
    action: ActionType,
    assemblyCode: AssemblyInstruction[]
): CPUState {
    const newRegisters: CPURegisters = { ...prevState.registers };

    // Increment Program Counter
    newRegisters.pc = currentLine;

    // Get assembly instructions for current line
    const currentInstructions = getAssemblyAtLine(assemblyCode, currentLine);

    // Update Instruction Register with current instruction
    if (currentInstructions.length > 0) {
        const inst = currentInstructions[0];
        newRegisters.ir = `${inst.instruction} ${inst.operands.join(', ')}`;

        // Simulate register updates based on instruction type
        switch (inst.instruction) {
            case 'LOAD':
                // LOAD Rx, value - load value into register
                if (inst.operands[0] === 'R0') {
                    // Try to parse numeric value
                    const value = inst.operands[1];
                    if (value.startsWith('#')) {
                        newRegisters.r0 = parseInt(value.substring(1)) || 0;
                    }
                } else if (inst.operands[0] === 'R1') {
                    const value = inst.operands[1];
                    if (value.startsWith('#')) {
                        newRegisters.r1 = parseInt(value.substring(1)) || 0;
                    }
                }
                break;

            case 'ADD':
                // ADD Rx, Ry - add registers
                if (inst.operands.length >= 2) {
                    newRegisters.acc = newRegisters.r0 + newRegisters.r1;
                }
                break;

            case 'SUB':
                newRegisters.acc = newRegisters.r0 - newRegisters.r1;
                break;

            case 'MUL':
                newRegisters.acc = newRegisters.r0 * newRegisters.r1;
                break;

            case 'DIV':
                newRegisters.acc = newRegisters.r1 !== 0 ? Math.floor(newRegisters.r0 / newRegisters.r1) : 0;
                break;

            case 'STORE':
                // STORE typically moves ACC to memory
                // For visualization, we'll just keep it in ACC
                break;

            case 'ALLOC':
                // Object/Array allocation - increment a register to simulate memory allocation
                if (inst.operands[0] === 'R0') {
                    newRegisters.r0 = prevState.cycleCount + 1;
                }
                break;
        }
    } else {
        // No assembly instruction for this line
        newRegisters.ir = 'NOP';
    }

    return {
        registers: newRegisters,
        pipeline: prevState.pipeline,
        assemblyCode,
        cycleCount: prevState.cycleCount + 1,
    };
}
