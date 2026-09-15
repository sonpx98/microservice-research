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
      <p className="text-center text-gray-500 dark:text-gray-500 py-8">
        No comments yet. Be the first to comment!
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {comments.map((c) => (
        <div 
          key={c.id}
          className="p-4 rounded-lg bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-400 to-orange-400 flex items-center justify-center text-white text-sm font-medium">
              H
            </div>
            <span className="font-medium text-gray-900 dark:text-white">Hacker</span>
            <span className="text-xs text-gray-500">just now</span>
          </div>
          {/* Safe render - shows code with highlighting, no execution */}
          <SafeCommentRender html={c.rendered} />
          {c.text !== c.rendered && (
            <div className="mt-3 p-2 rounded bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
              <p className="text-xs text-yellow-700 dark:text-yellow-300 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> <strong>Filtered:</strong> Some content was blocked
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
