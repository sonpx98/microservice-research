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
      className="fixed inset-0 bg-overlay backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-card rounded-2xl p-6 max-w-lg w-[90%] shadow-2xl animate-in zoom-in-95 duration-200 border border-border">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
            <Database className="w-6 h-6 text-success" />
          </div>
          <div>
            <h3 className="font-bold text-foreground text-lg">SQL Injection Success!</h3>
            <p className="text-sm text-success font-medium">✓ Attack successful</p>
          </div>
        </div>
        
        <div className="mb-4">
          <p className="text-sm text-muted-foreground mb-2">{message}</p>
        </div>
        
        <div className="p-3 rounded-lg bg-background mb-4 border border-input overflow-x-auto">
          <p className="text-xs text-muted-foreground mb-1">Executed Query:</p>
          <code className="text-success text-sm font-mono break-all">{query}</code>
        </div>
        
        {data && (
          <div className="p-3 rounded-lg bg-muted mb-4 border border-border max-h-40 overflow-y-auto">
            <p className="text-xs text-muted-foreground mb-1">Extracted Data:</p>
            <pre className="text-xs text-foreground font-mono">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        )}
        
        <p className="text-xs text-muted-foreground mb-4">
          In a real attack, this could expose sensitive data, bypass authentication, or even delete databases.
        </p>
        <button
          onClick={onClose}
          className="w-full py-3 bg-success hover:bg-success/90 text-success-foreground rounded-xl font-semibold transition-colors"
        >
          Got it!
        </button>
      </div>
    </div>
  );
}

export default SQLAlertModal;