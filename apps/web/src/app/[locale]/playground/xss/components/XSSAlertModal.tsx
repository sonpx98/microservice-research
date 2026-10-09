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
      className="fixed inset-0 bg-overlay backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-card rounded-2xl p-6 max-w-sm w-[90%] shadow-2xl animate-in zoom-in-95 duration-200 border border-border">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-danger/10 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-danger" />
          </div>
          <div>
            <h3 className="font-bold text-foreground text-lg">XSS Alert!</h3>
            <p className="text-sm text-success font-medium">✓ Attack successful</p>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-background mb-4 border border-input">
          <code className="text-success break-all text-sm">{message}</code>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          In a real attack, this could steal cookies, redirect users, or modify the page.
        </p>
        <button
          onClick={onClose}
          className="w-full py-3 bg-danger hover:bg-danger/90 text-danger-foreground rounded-xl font-semibold transition-colors"
        >
          Got it!
        </button>
      </div>
    </div>
  );
}