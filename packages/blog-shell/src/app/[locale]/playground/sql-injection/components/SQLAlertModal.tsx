import { 
  Database,
} from 'lucide-react';

// SQL Alert Modal Component
export function SQLAlertModal({ 
  message,
  data,
  query,
  onClose 
}: { 
  message: string;
  data?: any;
  query: string;
  onClose: () => void;
}) {
  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-lg w-[90%] shadow-2xl animate-in zoom-in-95 duration-200 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <Database className="w-6 h-6 text-green-500" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-lg">SQL Injection Success!</h3>
            <p className="text-sm text-green-600 dark:text-green-400 font-medium">✓ Attack successful</p>
          </div>
        </div>
        
        <div className="mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{message}</p>
        </div>
        
        <div className="p-3 rounded-lg bg-gray-900 dark:bg-black mb-4 border border-gray-700 overflow-x-auto">
          <p className="text-xs text-gray-400 mb-1">Executed Query:</p>
          <code className="text-green-400 text-sm font-mono break-all">{query}</code>
        </div>
        
        {data && (
          <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-900 mb-4 border border-gray-200 dark:border-gray-700 max-h-40 overflow-y-auto">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Extracted Data:</p>
            <pre className="text-xs text-gray-700 dark:text-gray-300 font-mono">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        )}
        
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
          In a real attack, this could expose sensitive data, bypass authentication, or even delete databases.
        </p>
        <button
          onClick={onClose}
          className="w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold transition-colors"
        >
          Got it!
        </button>
      </div>
    </div>
  );
}

export default SQLAlertModal;