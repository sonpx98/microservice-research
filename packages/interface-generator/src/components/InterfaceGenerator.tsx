import { useState } from 'react';
import { CodeEditor } from './CodeEditor';
import { Button } from './Button';
import { 
  generateNestedInterfaces, 
  generateType, 
  parseInput 
} from '@/utils/typescript-generator';
import { Copy, Download, RefreshCw, ChevronDown } from 'lucide-react';

export function InterfaceGenerator() {
  const [jsonInput, setJsonInput] = useState('');
  const [interfaceName, setInterfaceName] = useState('GeneratedInterface');
  const [typeName, setTypeName] = useState('GeneratedType');
  const [generatedInterface, setGeneratedInterface] = useState('');
  const [generatedType, setGeneratedType] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('interface');
  const [inputType, setInputType] = useState<'json' | 'object'>('json');
  const [copySuccess, setCopySuccess] = useState('');
  const [currentLanguage, setCurrentLanguage] = useState<'json' | 'javascript'>('json');

  // Auto-detect language based on input
  const detectLanguage = (input: string): 'json' | 'javascript' => {
    const trimmed = input.trim();
    if (!trimmed) return 'json';
    
    // Check if it starts with common JS patterns
    if (trimmed.startsWith('const ') || 
        trimmed.startsWith('let ') || 
        trimmed.startsWith('var ') ||
        (trimmed.startsWith('{') && !trimmed.includes('"'))) {
      return 'javascript';
    }
    
    // Try to parse as JSON
    try {
      JSON.parse(trimmed);
      return 'json';
    } catch {
      return 'javascript';
    }
  };

  const handleInputChange = (value: string | undefined) => {
    const newValue = value || '';
    setJsonInput(newValue);
    
    // Auto-detect and set language
    const detectedLanguage = detectLanguage(newValue);
    setCurrentLanguage(detectedLanguage);
  };

  const exampleJson = JSON.stringify({
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    active: true,
    profile: {
      age: 30,
      address: {
        street: "123 Main St",
        city: "New York",
        zipCode: "10001"
      },
      hobbies: ["reading", "coding", "gaming"]
    },
    roles: [
      { id: 1, name: "admin", permissions: ["read", "write"] },
      { id: 2, name: "user", permissions: ["read"] }
    ]
  }, null, 2);

  const exampleObject = `const user = {
  id: 1,
    name: "John Doe",
    email: "john@example.com",
    active: true,
    profile: {
        age: 30,
        address: {
        street: "123 Main St",
        city: "New York",
        zipCode: "10001"
        },
        hobbies: ["reading", "coding", "gaming"]
    },
    roles: [
        { id: 1, name: "admin", permissions: ["read", "write"] },
        { id: 2, name: "user", permissions: ["read"] }
    ]
    }`;

  const loadExample = (type: 'json' | 'object' = 'json') => {
    const example = type === 'json' ? exampleJson : exampleObject;
    setJsonInput(example);
    
    // Update language based on example type
    setCurrentLanguage(type === 'json' ? 'json' : 'javascript');
  };


  const handleCopy = async (content: string) => {
    try {
      // Modern browsers
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(content);
        setCopySuccess('Copied to clipboard!');
      } else {
        // Fallback for older browsers or non-secure contexts
        const textArea = document.createElement('textarea');
        textArea.value = content;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (successful) {
          setCopySuccess('Copied to clipboard!');
        } else {
          throw new Error('Copy command failed');
        }
      }
      
      // Clear success message after 2 seconds
      setTimeout(() => setCopySuccess(''), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
      setCopySuccess('Failed to copy - please copy manually');
      setTimeout(() => setCopySuccess(''), 3000);
    }
  };

  const handleDownload = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleGenerate = () => {
        if (!jsonInput.trim()) {
      setError('Please enter JSON or object data');
      return;
    }

    const validation = parseInput(jsonInput);
    if (!validation.isValid) {
      setError(validation.error || 'Invalid input');
      return;
    }

    try {
      const interfaceResult = generateNestedInterfaces(validation.parsed, interfaceName);
      const typeResult = generateType(validation.parsed, typeName);
      
      setGeneratedInterface(interfaceResult);
      setGeneratedType(typeResult);
      setError('');
      
      // Update input type indicator
      if (validation.inputType) {
        setInputType(validation.inputType);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const clear = () => {
    setJsonInput('');
    setGeneratedInterface('');
    setGeneratedType('');
    setError('');
  };

  return (
    <div className="interfacegen:min-h-screen interfacegen:bg-gray-50 interfacegen:p-4">
      <div className="interfacegen:max-w-7xl interfacegen:mx-auto">
        <div className="interfacegen:text-center interfacegen:mb-8">
          <h1 className="interfacegen:text-4xl interfacegen:font-bold interfacegen:text-gray-900 interfacegen:mb-4">
            TypeScript Interface Generator
          </h1>
          <p className="interfacegen:text-lg interfacegen:text-gray-600">
            Convert JSON or JavaScript objects to TypeScript interfaces and types
          </p>
          <div className="interfacegen:mt-4 interfacegen:text-sm interfacegen:text-gray-500">
            <p>✅ Supports JSON format: <code className="interfacegen:bg-gray-100 interfacegen:px-2 interfacegen:py-1 interfacegen:rounded">{"{ \"key\": \"value\" }"}</code></p>
            <p>✅ Supports Object format: <code className="interfacegen:bg-gray-100 interfacegen:px-2 interfacegen:py-1 interfacegen:rounded">{"{ key: \"value\" }"}</code></p>
            <p>✅ Supports Variable declarations: <code className="interfacegen:bg-gray-100 interfacegen:px-2 interfacegen:py-1 interfacegen:rounded">{"const obj = { ... }"}</code></p>
          </div>
        </div>

        <div className="interfacegen:grid interfacegen:grid-cols-1 lg:interfacegen:grid-cols-2 interfacegen:gap-6">
          {/* Input Section */}
          <div className="interfacegen:bg-white interfacegen:p-6 interfacegen:rounded-lg interfacegen:shadow-md">
            <div className="interfacegen:mb-4">
              <h2 className="interfacegen:text-xl interfacegen:font-semibold interfacegen:mb-4">JSON/Object Input</h2>
              
              <div className="interfacegen:flex interfacegen:gap-2 interfacegen:mb-4">
                <Button onClick={() => loadExample('json')} variant="outline" size="sm">
                  Load JSON Example
                </Button>
                <Button onClick={() => loadExample('object')} variant="outline" size="sm">
                  Load Object Example
                </Button>
                <Button onClick={clear} variant="outline" size="sm">
                  <RefreshCw className="interfacegen:w-4 interfacegen:h-4" />
                  Clear
                </Button>
              </div>

              <div className="interfacegen:grid interfacegen:grid-cols-1 md:interfacegen:grid-cols-2 interfacegen:gap-4 interfacegen:mb-4">
                <div>
                  <label className="interfacegen:block interfacegen:text-sm interfacegen:font-medium interfacegen:mb-2">
                    Interface Name
                  </label>
                  <input
                    type="text"
                    value={interfaceName}
                    onChange={(e) => setInterfaceName(e.target.value)}
                    className="interfacegen:w-full interfacegen:p-2 interfacegen:border interfacegen:rounded-md focus:interfacegen:ring-2 focus:interfacegen:ring-blue-500 focus:interfacegen:border-transparent"
                    placeholder="GeneratedInterface"
                  />
                </div>
                <div>
                  <label className="interfacegen:block interfacegen:text-sm interfacegen:font-medium interfacegen:mb-2">
                    Type Name
                  </label>
                  <input
                    type="text"
                    value={typeName}
                    onChange={(e) => setTypeName(e.target.value)}
                    className="interfacegen:w-full interfacegen:p-2 interfacegen:border interfacegen:rounded-md focus:interfacegen:ring-2 focus:interfacegen:ring-blue-500 focus:interfacegen:border-transparent"
                    placeholder="GeneratedType"
                  />
                </div>
              </div>
            </div>

            <CodeEditor
              value={jsonInput}
              onChange={handleInputChange}
              language={currentLanguage}
              placeholder="Enter your JSON or JavaScript object here..."
              height="400px"
            />

            {error && (
              <div className="interfacegen:mt-4 interfacegen:p-3 interfacegen:bg-red-100 interfacegen:border interfacegen:border-red-300 interfacegen:text-red-700 interfacegen:rounded-md">
                {error}
              </div>
            )}

            {inputType && generatedInterface && (
              <div className="interfacegen:mt-4 interfacegen:p-3 interfacegen:bg-green-100 interfacegen:border interfacegen:border-green-300 interfacegen:text-green-700 interfacegen:rounded-md interfacegen:text-sm">
                ✅ Successfully parsed as {inputType.toUpperCase()}
              </div>
            )}

            {copySuccess && (
              <div className={`interfacegen:mt-4 interfacegen:p-3 interfacegen:border interfacegen:rounded-md interfacegen:text-sm ${
                copySuccess.includes('Failed') 
                  ? 'interfacegen:bg-red-100 interfacegen:border-red-300 interfacegen:text-red-700'
                  : 'interfacegen:bg-green-100 interfacegen:border-green-300 interfacegen:text-green-700'
              }`}>
                {copySuccess}
              </div>
            )}

            <div className="interfacegen:mt-4">
              <Button onClick={handleGenerate} className="interfacegen:w-full" variant="outline">
                Generate TypeScript
              </Button>
            </div>
          </div>

          {/* Output Section */}
          <div className="interfacegen:bg-white interfacegen:p-6 interfacegen:rounded-lg interfacegen:shadow-md">
            <div className="interfacegen:flex interfacegen:items-center interfacegen:justify-between interfacegen:mb-4">
              <h2 className="interfacegen:text-xl interfacegen:font-semibold">Generated Output</h2>
              
              {/* Output Type Selector */}
              <div className="interfacegen:relative">
                <select
                  value={activeTab}
                  onChange={(e) => setActiveTab(e.target.value)}
                  className="interfacegen:appearance-none interfacegen:bg-white interfacegen:border interfacegen:border-gray-300 interfacegen:rounded-md interfacegen:px-4 interfacegen:py-2 interfacegen:pr-8 focus:interfacegen:ring-2 focus:interfacegen:ring-blue-500 focus:interfacegen:border-transparent interfacegen:text-sm interfacegen:font-medium"
                >
                  <option value="interface">Interface</option>
                  <option value="type">Type</option>
                </select>
                <ChevronDown className="interfacegen:absolute interfacegen:right-2 interfacegen:top-1/2 interfacegen:-translate-y-1/2 interfacegen:w-4 interfacegen:h-4 interfacegen:text-gray-400 interfacegen:pointer-events-none" />
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="interfacegen:flex interfacegen:gap-2 interfacegen:mb-4">
              <Button
                onClick={() => handleCopy(activeTab === 'interface' ? generatedInterface : generatedType)}
                variant="outline"
                size="sm"
                disabled={activeTab === 'interface' ? !generatedInterface : !generatedType}
              >
                <Copy className="interfacegen:w-4 interfacegen:h-4" />
                Copy {activeTab === 'interface' ? 'Interface' : 'Type'}
              </Button>
              <Button
                onClick={() => handleDownload(
                  activeTab === 'interface' ? generatedInterface : generatedType,
                  activeTab === 'interface' ? `${interfaceName}.ts` : `${typeName}.ts`
                )}
                variant="outline"
                size="sm"
                disabled={activeTab === 'interface' ? !generatedInterface : !generatedType}
              >
                <Download className="interfacegen:w-4 interfacegen:h-4" />
                Download {activeTab === 'interface' ? 'Interface' : 'Type'}
              </Button>
            </div>
            
            {/* Code Editor */}
            <CodeEditor
              value={activeTab === 'interface' ? generatedInterface : generatedType}
              onChange={() => {}}
              language="typescript"
              readOnly
              height="400px"
            />
          </div>
        </div>
            </div>
    </div>
  );
}