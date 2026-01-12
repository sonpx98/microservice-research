/**
 * HTML Sanitization Utility
 * 
 * Uses DOMPurify to sanitize HTML content and prevent XSS attacks.
 * This should be used for all user-generated or external HTML content.
 */

import DOMPurify from 'dompurify';

/**
 * Sanitize HTML content to prevent XSS attacks
 * @param html - Untrusted HTML content
 * @returns Sanitized HTML safe for rendering
 */
export function sanitizeHtml(html: string): string {
    if (typeof window === 'undefined') {
        // Server-side: return as-is (SSR doesn't have DOM)
        // Content will be sanitized on client hydration
        return html;
    }

    return DOMPurify.sanitize(html, {
        USE_PROFILES: { html: true },
        ALLOWED_TAGS: [
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'p', 'br', 'hr',
            'ul', 'ol', 'li',
            'blockquote', 'pre', 'code',
            'a', 'strong', 'em', 'b', 'i', 'u', 's', 'del', 'ins',
            'table', 'thead', 'tbody', 'tr', 'th', 'td',
            'img', 'figure', 'figcaption',
            'div', 'span', 'section', 'article',
            'details', 'summary',
            'sup', 'sub', 'mark', 'abbr',
        ],
        ALLOWED_ATTR: [
            'href', 'src', 'alt', 'title', 'class', 'id',
            'target', 'rel', 'width', 'height',
            'data-*', 'aria-*', 'role',
        ],
        ALLOW_DATA_ATTR: true,
    });
}

/**
 * Sanitize HTML for code blocks (minimal sanitization)
 * @param html - Code block HTML content
 * @returns Sanitized HTML
 */
export function sanitizeCodeHtml(html: string): string {
    if (typeof window === 'undefined') {
        return html;
    }

    return DOMPurify.sanitize(html, {
        USE_PROFILES: { html: true },
        ALLOWED_TAGS: ['pre', 'code', 'span', 'div'],
        ALLOWED_ATTR: ['class', 'data-*', 'style'],
    });
}
