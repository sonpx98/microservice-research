export function inferType(value: any): string {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  
  const type = typeof value;
  
  if (type === 'boolean') return 'boolean';
  if (type === 'number') return 'number';
  if (type === 'string') return 'string';
  if (type === 'function') return 'Function';
  
  if (Array.isArray(value)) {
    if (value.length === 0) return 'any[]';
    
    // Get types of all elements
    const elementTypes = value.map(item => inferType(item));
    const uniqueTypes = [...new Set(elementTypes)];
    
    if (uniqueTypes.length === 1) {
      return `${uniqueTypes[0]}[]`;
    } else {
      return `(${uniqueTypes.join(' | ')})[]`;
    }
  }
  
  if (type === 'object') {
    return 'object';
  }
  
  return 'any';
}

export function generateInterface(obj: any, interfaceName: string = 'GeneratedInterface', indent: number = 0): string {
  if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
    throw new Error('Input must be a valid object');
  }
  
  const indentStr = '  '.repeat(indent);
  let result = `${indentStr}interface ${interfaceName} {\n`;
  
  for (const [key, value] of Object.entries(obj)) {
    const safeKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : `"${key}"`;
    
    if (value === null || value === undefined) {
      result += `${indentStr}  ${safeKey}: ${inferType(value)};\n`;
    } else if (Array.isArray(value)) {
      result += `${indentStr}  ${safeKey}: ${inferType(value)};\n`;
    } else if (typeof value === 'object') {
      // Generate nested interface
      const nestedInterfaceName = `${interfaceName}${capitalize(key)}`;
      result += `${indentStr}  ${safeKey}: ${nestedInterfaceName};\n`;
    } else {
      result += `${indentStr}  ${safeKey}: ${inferType(value)};\n`;
    }
  }
  
  result += `${indentStr}}`;
  return result;
}

export function generateNestedInterfaces(obj: any, interfaceName: string = 'GeneratedInterface'): string {
  const interfaces: string[] = [];
  
  function processObject(currentObj: any, currentName: string) {
    if (typeof currentObj !== 'object' || currentObj === null || Array.isArray(currentObj)) {
      return;
    }
    
    let interfaceStr = `interface ${currentName} {\n`;
    
    for (const [key, value] of Object.entries(currentObj)) {
      const safeKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : `"${key}"`;
      
      if (value === null || value === undefined) {
        interfaceStr += `  ${safeKey}: ${inferType(value)};\n`;
      } else if (Array.isArray(value)) {
        // Handle array types
        if (value.length > 0 && typeof value[0] === 'object' && value[0] !== null && !Array.isArray(value[0])) {
          const arrayItemInterfaceName = `${currentName}${capitalize(key)}Item`;
          processObject(value[0], arrayItemInterfaceName);
          interfaceStr += `  ${safeKey}: ${arrayItemInterfaceName}[];\n`;
        } else {
          interfaceStr += `  ${safeKey}: ${inferType(value)};\n`;
        }
      } else if (typeof value === 'object') {
        const nestedInterfaceName = `${currentName}${capitalize(key)}`;
        processObject(value, nestedInterfaceName);
        interfaceStr += `  ${safeKey}: ${nestedInterfaceName};\n`;
      } else {
        interfaceStr += `  ${safeKey}: ${inferType(value)};\n`;
      }
    }
    
    interfaceStr += '}';
    interfaces.push(interfaceStr);
  }
  
  processObject(obj, interfaceName);
  
  return interfaces.reverse().join('\n\n');
}

export function generateType(obj: any, typeName: string = 'GeneratedType'): string {
  if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
    throw new Error('Input must be a valid object');
  }
  
  let result = `type ${typeName} = {\n`;
  
  for (const [key, value] of Object.entries(obj)) {
    const safeKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : `"${key}"`;
    
    if (value === null || value === undefined) {
      result += `  ${safeKey}: ${inferType(value)};\n`;
    } else if (Array.isArray(value)) {
      result += `  ${safeKey}: ${inferType(value)};\n`;
    } else if (typeof value === 'object') {
      const nestedType = generateTypeForObject(value);
      result += `  ${safeKey}: ${nestedType};\n`;
    } else {
      result += `  ${safeKey}: ${inferType(value)};\n`;
    }
  }
  
  result += '}';
  return result;
}

function generateTypeForObject(obj: any): string {
  if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
    return inferType(obj);
  }
  
  let result = '{\n';
  
  for (const [key, value] of Object.entries(obj)) {
    const safeKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : `"${key}"`;
    
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      result += `    ${safeKey}: ${generateTypeForObject(value)};\n`;
    } else {
      result += `    ${safeKey}: ${inferType(value)};\n`;
    }
  }
  
  result += '  }';
  return result;
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function validateJSON(jsonString: string): { isValid: boolean; error?: string; parsed?: any } {
  try {
    const parsed = JSON.parse(jsonString);
    return { isValid: true, parsed };
  } catch (error) {
    return { 
      isValid: false, 
      error: error instanceof Error ? error.message : 'Invalid JSON' 
    };
  }
}

export function parseInput(input: string): { isValid: boolean; error?: string; parsed?: any; inputType?: 'json' | 'object' } {
  const trimmedInput = input.trim();
  
  if (!trimmedInput) {
    return { isValid: false, error: 'Input is empty' };
  }

  // Try to parse as JSON first
  try {
    const parsed = JSON.parse(trimmedInput);
    return { isValid: true, parsed, inputType: 'json' };
  } catch (jsonError) {
    // If JSON parsing fails, try to evaluate as JavaScript object
    try {
      // Remove potential variable declaration (const obj = {...})
      let objectString = trimmedInput;
      
      // Check if it's a variable declaration
      const variableDeclarationMatch = objectString.match(/^(const|let|var)\s+\w+\s*=\s*(.+)$/s);
      if (variableDeclarationMatch && variableDeclarationMatch[2]) {
        objectString = variableDeclarationMatch[2];
      }
      
      // Wrap in parentheses and evaluate
      const wrapped = `(${objectString})`;
      const parsed = eval(wrapped);
      
      if (typeof parsed === 'object' && parsed !== null) {
        return { isValid: true, parsed, inputType: 'object' };
      } else {
        return { 
          isValid: false, 
          error: 'Input must be a valid object or JSON' 
        };
      }
    } catch (objectError) {
      return { 
        isValid: false, 
        error: `Invalid input format. Expected JSON or JavaScript object.\nJSON Error: ${jsonError instanceof Error ? jsonError.message : 'Unknown JSON error'}\nObject Error: ${objectError instanceof Error ? objectError.message : 'Unknown object error'}` 
      };
    }
  }
}