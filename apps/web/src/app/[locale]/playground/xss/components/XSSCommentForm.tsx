import { Button } from '@/components/ui/button';
import { AlertTriangle, Unlock } from 'lucide-react';

interface XSSCommentFormProps {
  comment: string;
  hasFilter: boolean;
  onCommentChange: (value: string) => void;
  onSubmit: () => void;
}

export function XSSCommentForm({
  comment,
  hasFilter,
  onCommentChange,
  onSubmit,
}: XSSCommentFormProps) {
  return (
    <div className="mb-6">
      <textarea
        value={comment}
        onChange={(e) => onCommentChange(e.target.value)}
        placeholder="Write a comment... (try to inject some XSS!)"
        className="w-full p-4 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
        rows={3}
      />
      <div className="flex items-center justify-between mt-3">
        <p className="text-xs text-gray-500 dark:text-gray-500 flex items-center gap-1">
          {hasFilter ? <><AlertTriangle className="w-3 h-3" /> Some input filtering is active</> : <><Unlock className="w-3 h-3" /> No input filtering</>}
        </p>
        <Button
          onClick={onSubmit}
          disabled={!comment.trim()}
          className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400"
        >
          Post Comment
        </Button>
      </div>
    </div>
  );
}
