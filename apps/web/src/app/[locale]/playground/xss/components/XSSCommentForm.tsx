import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
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
      <Textarea
        value={comment}
        onChange={(e) => onCommentChange(e.target.value)}
        placeholder="Write a comment... (try to inject some XSS!)"
        className="resize-none font-mono"
        rows={3}
      />
      <div className="flex items-center justify-between mt-3">
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          {hasFilter ? <><AlertTriangle className="w-3 h-3" /> Some input filtering is active</> : <><Unlock className="w-3 h-3" /> No input filtering</>}
        </p>
        <Button onClick={onSubmit} disabled={!comment.trim()}>
          Post Comment
        </Button>
      </div>
    </div>
  );
}
