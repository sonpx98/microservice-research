import { 
  AlertTriangle
} from 'lucide-react';

// XSS Alert Modal Component
export function XSSAlertModal({ 
  message, 
  onClose 
}: { 
  message: string; 
  onClose: () => void;
}) {
  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-[90%] shadow-2xl animate-in zoom-in-95 duration-200 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-lg">XSS Alert!</h3>
            <p className="text-sm text-green-600 dark:text-green-400 font-medium">✓ Attack successful</p>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-gray-900 dark:bg-black mb-4 border border-gray-700">
          <code className="text-green-400 break-all text-sm">{message}</code>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
          In a real attack, this could steal cookies, redirect users, or modify the page.
        </p>
        <button
          onClick={onClose}
          className="w-full py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition-colors"
        >
          Got it!
        </button>
      </div>
    </div>
  );
}