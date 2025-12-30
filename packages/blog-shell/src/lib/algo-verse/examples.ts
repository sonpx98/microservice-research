import { CodeExample } from './types';

/**
 * Pre-built code examples for demonstration
 */

export const codeExamples: CodeExample[] = [
  {
    id: 'simple-function',
    title: 'Simple Function Call',
    description: 'Basic function call with parameters and return value',
    difficulty: 'beginner',
    code: `function greet(name) {
  const message = "Hello, " + name;
  return message;
}

const result = greet("World");
console.log(result);`,
  },
  {
    id: 'factorial',
    title: 'Recursive Factorial',
    description: 'Recursive function demonstrating call stack growth',
    difficulty: 'intermediate',
    code: `function factorial(n) {
  if (n <= 1) {
    return 1;
  }
  return n * factorial(n - 1);
}

const result = factorial(4);
console.log(result);`,
  },
  {
    id: 'object-creation',
    title: 'Object Creation & References',
    description: 'Creating objects and understanding heap allocation',
    difficulty: 'beginner',
    code: `function createUser(name, age) {
  const user = {
    name: name,
    age: age
  };
  return user;
}

const person = createUser("Alice", 25);
console.log(person.name);`,
  },
  {
    id: 'multiple-calls',
    title: 'Multiple Function Calls',
    description: 'Multiple functions calling each other',
    difficulty: 'intermediate',
    code: `function add(a, b) {
  return a + b;
}

function multiply(x, y) {
  return x * y;
}

function calculate(num) {
  const sum = add(num, 5);
  const product = multiply(sum, 2);
  return product;
}

const result = calculate(10);
console.log(result);`,
  },
  {
    id: 'variable-scope',
    title: 'Variable Scope',
    description: 'Demonstrating local vs global scope',
    difficulty: 'beginner',
    code: `let globalVar = "I'm global";

function outer() {
  let outerVar = "I'm outer";
  
  function inner() {
    let innerVar = "I'm inner";
    console.log(globalVar);
    console.log(outerVar);
    console.log(innerVar);
  }
  
  inner();
}

outer();`,
  },
  {
    id: 'scope-demonstration',
    title: 'Global vs Local Scope',
    description: 'Clear demonstration of global and local variable scope with objects',
    difficulty: 'beginner',
    code: `const globalName = "Global";

function createPerson(name) {
  const localAge = 25;
  const person = {
    name: name,
    age: localAge
  };
  return person;
}

const user = createPerson("Alice");
console.log(user.name);`,
  },
  {
    id: 'array-operations',
    title: 'Array Operations',
    description: 'Working with arrays in heap memory',
    difficulty: 'intermediate',
    code: `function processArray(arr) {
  const doubled = [];
  
  for (let i = 0; i < arr.length; i++) {
    doubled[i] = arr[i] * 2;
  }
  
  return doubled;
}

const numbers = [1, 2, 3];
const result = processArray(numbers);
console.log(result);`,
  },
];

export const getExampleById = (id: string): CodeExample | undefined => {
  return codeExamples.find(example => example.id === id);
};

export const getExamplesByDifficulty = (difficulty: CodeExample['difficulty']): CodeExample[] => {
  return codeExamples.filter(example => example.difficulty === difficulty);
};
