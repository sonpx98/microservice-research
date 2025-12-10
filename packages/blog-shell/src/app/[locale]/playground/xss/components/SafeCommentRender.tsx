/**
 * Render comment with XSS payloads highlighted but NOT executed
 */
export function SafeCommentRender({ html }: { html: string }) {
  const highlightDanger = (text: string) => {
    return text
      .replace(/(&lt;script[^&]*&gt;)([\s\S]*?)(&lt;\/script&gt;)/gi, 
        '<span class="text-red-400 bg-red-500/10 px-1 rounded">$1$2$3</span>')
      .replace(/(on\w+\s*=\s*[&quot;'"][^&quot;'"]*[&quot;'"])/gi,
        '<span class="text-orange-400 bg-orange-500/10 px-1 rounded">$1</span>')
      .replace(/(javascript:[^&quot;'"\s&]*)/gi,
        '<span class="text-yellow-400 bg-yellow-500/10 px-1 rounded">$1</span>')
      .replace(/(&#[\dx]+;)/gi,
        '<span class="text-purple-400">$1</span>');
  };

  const escapeHtml = (text: string) => {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  const escaped = escapeHtml(html);
  const highlighted = highlightDanger(escaped);

  return (
    <div 
      className="font-mono text-sm text-gray-700 dark:text-gray-300 break-all leading-relaxed"
      dangerouslySetInnerHTML={{ __html: highlighted }}
    />
  );
}
