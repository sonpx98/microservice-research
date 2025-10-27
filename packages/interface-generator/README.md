# TypeScript Interface Generator

A powerful tool that converts JSON objects and JavaScript objects into TypeScript interfaces and types using Monaco Editor.

## Features

- 🔄 Real-time JSON and JavaScript object to TypeScript conversion
- 📝 Code editor with syntax highlighting and validation  
- 🏗️ Support for nested objects and arrays
- 📋 Generate both interfaces and types
- 🎯 Smart input detection (JSON vs JavaScript object)
- 📥 Copy to clipboard functionality
- 💾 Download generated files
- 🎨 Clean, responsive UI with TailwindCSS
- 🔌 Module Federation ready

## Supported Input Formats

### JSON Format
```json
{
  "id": 1,
  "name": "John Doe",
  "profile": {
    "age": 30,
    "hobbies": ["reading", "coding"]
  }
}
```

### JavaScript Object Format
```javascript
const user = {
  id: 1,
  name: "John Doe",
  profile: {
    age: 30,
    hobbies: ["reading", "coding"]
  }
}
```

### Object Literal (without variable declaration)
```javascript
{
  id: 1,
  name: "John Doe",
  profile: {
    age: 30,
    hobbies: ["reading", "coding"]
  }
}
```

## Usage

1. Enter or paste your JSON/Object data in the left editor
2. Choose "Load JSON Example" or "Load Object Example" for quick start
3. Customize the interface/type names
4. Click "Generate TypeScript" 
5. View results in the Interface or Type tabs
6. Copy or download the generated code

The tool automatically detects whether your input is JSON or a JavaScript object and parses accordingly.

Generated Interface:
```typescript
interface GeneratedInterface {
  id: number;
  name: string;
  profile: GeneratedInterfaceProfile;
}

interface GeneratedInterfaceProfile {
  age: number;
  hobbies: string[];
}
```

## Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build
```

## Port

This micro-frontend runs on port 5007.

## Module Federation

This package exposes:
- `./app` - Main application component

Can be consumed by other micro-frontends in the portfolio.