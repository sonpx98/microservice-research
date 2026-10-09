import { SafeCommentRender } from './SafeCommentRender';
import { AlertTriangle } from 'lucide-react';

interface Comment {
  id: number;
  text: string;
  rendered: string;
}

interface XSSCommentsListProps {
  comments: Comment[];
}

export function XSSCommentsList({ comments }: XSSCommentsListProps) {
  if (comments.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-8">
        No comments yet. Be the first to comment!
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {comments.map((c) => (
        <div 
          key={c.id}
          className="p-4 rounded-lg bg-muted border border-border"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-danger flex items-center justify-center text-danger-foreground text-sm font-medium">
              H
            </div>
            <span className="font-medium text-foreground">Hacker</span>
            <span className="text-xs text-muted-foreground">just now</span>
          </div>
          {/* Safe render - shows code with highlighting, no execution */}
          <SafeCommentRender html={c.rendered} />
          {c.text !== c.rendered && (
            <div className="mt-3 p-2 rounded bg-warning/10 border border-warning/30">
              <p className="text-xs text-warning flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> <strong>Filtered:</strong> Some content was blocked
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
