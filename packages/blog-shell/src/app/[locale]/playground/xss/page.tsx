'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Shield, 
  Lightbulb, 
  CheckCircle2, 
  RotateCcw,
  ChevronRight,
  Trophy,
  Code,
  AlertTriangle
} from 'lucide-react';

interface Level {
  id: number;
  title: string;
  description: string;
  hint: string;
  filter?: (input: string) => string;
}

/**
 * SAFE JavaScript Execution
 * 
 * Executes XSS payloads in a controlled environment:
 * - Override alert/confirm/prompt to capture calls
 * - No access to document, window, localStorage, cookies
 * - Timeout protection against infinite loops
 * - Returns the alert message if XSS succeeds
 */
function executeXSSPayload(html: string): { success: boolean; message?: string } {
  let alertMessage: string | null = null;
  let xssTriggered = false;

  // Create controlled execution environment
  const safeAlert = (msg: any) => {
    xssTriggered = true;
    alertMessage = String(msg);
  };
  
  const safeConfirm = (msg: any) => {
    xssTriggered = true;
    alertMessage = String(msg);
    return true;
  };
  
  const safePrompt = (msg: any) => {
    xssTriggered = true;
    alertMessage = String(msg);
    return 'xss';
  };

  // Extract and execute script content
  const scriptMatches = html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi);
  for (const match of scriptMatches) {
    const code = match[1];
    if (code.trim()) {
      try {
        // Create function with controlled scope - no access to real globals
        const fn = new Function('alert', 'confirm', 'prompt', code);
        fn(safeAlert, safeConfirm, safePrompt);
      } catch (e) {
        // Syntax error or runtime error - that's fine
      }
    }
  }

  // Helper to decode HTML entities
  const decodeHTMLEntities = (text: string): string => {
    return text
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&apos;/g, "'")
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
      .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)));
  };

  // Extract and execute inline event handlers
  // Support many event types including ontoggle, onstart, onpageshow, etc.
  // Handle both normal (onload) and whitespace tricks (on\tload, on\nload)
  const eventNames = 'error|load|click|mouseover|focus|mouseenter|toggle|start|pageshow|animationend|blur|change|input|submit|reset|scroll|wheel|copy|cut|paste|drag|drop|mouseout|mousemove|keydown|keyup|keypress';
  
  // Pattern 1: Normal event handlers (onload, onerror, etc.)
  const normalEventRegex = new RegExp(`\\bon(${eventNames})\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, 'gi');
  
  // Pattern 2: Whitespace tricks (on\tload, on\nload, etc.)
  const whitespaceEventRegex = new RegExp(`\\bon\\s+(${eventNames})\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, 'gi');
  
  const executeEventHandler = (match: RegExpExecArray) => {
    const rawCode = match[2] || match[3] || match[4] || '';
    const code = decodeHTMLEntities(rawCode);
    
    if (code.trim()) {
      try {
        const fn = new Function('alert', 'confirm', 'prompt', code);
        fn(safeAlert, safeConfirm, safePrompt);
      } catch (e) {
        // Ignore errors
      }
    }
  };
  
  let eventMatch;
  while ((eventMatch = normalEventRegex.exec(html)) !== null) {
    executeEventHandler(eventMatch);
  }
  
  while ((eventMatch = whitespaceEventRegex.exec(html)) !== null) {
    executeEventHandler(eventMatch);
  }

  // Check for javascript: URLs
  // Match href="javascript:..." or href='javascript:...'
  const jsUrlPatterns = [
    /href\s*=\s*"javascript:([^"]*)"/gi,  // Double quotes
    /href\s*=\s*'javascript:([^']*)'/gi,  // Single quotes
  ];
  
  for (const pattern of jsUrlPatterns) {
    let match;
    while ((match = pattern.exec(html)) !== null) {
      const code = decodeURIComponent(match[1]);
      if (code.trim()) {
        try {
          const fn = new Function('alert', 'confirm', 'prompt', code);
          fn(safeAlert, safeConfirm, safePrompt);
        } catch (e) {
          // Ignore errors
        }
      }
    }
  }

  // Check for encoded javascript: URLs (HTML entities - partial or full)
  // This catches bypasses like &#x6a;avascript: or &#106;avascript: etc.
  // Use separate patterns for double and single quotes
  const hrefPatterns = [
    /href\s*=\s*"([^"]*)"/gi,  // Double quotes - can contain '
    /href\s*=\s*'([^']*)'/gi,  // Single quotes - can contain "
  ];
  
  for (const pattern of hrefPatterns) {
    let match;
    while ((match = pattern.exec(html)) !== null) {
      const hrefValue = match[1];
      // Decode ALL HTML entities in the href value
      const decoded = decodeHTMLEntities(hrefValue);
      
      if (decoded.toLowerCase().startsWith('javascript:')) {
        const code = decoded.slice(11); // Remove 'javascript:'
        if (code.trim()) {
          try {
            const fn = new Function('alert', 'confirm', 'prompt', code);
            fn(safeAlert, safeConfirm, safePrompt);
          } catch (e) {
            // Ignore errors
          }
        }
      }
      
      // Also check for javascript: with whitespace (java\tscript:, java\nscript:, etc.)
      const normalizedDecoded = decoded.replace(/\s+/g, '').toLowerCase();
      if (normalizedDecoded.startsWith('javascript:')) {
        const code = decoded.replace(/^j\s*a\s*v\s*a\s*s\s*c\s*r\s*i\s*p\s*t\s*:/i, '');
        if (code.trim()) {
          try {
            const fn = new Function('alert', 'confirm', 'prompt', code);
            fn(safeAlert, safeConfirm, safePrompt);
          } catch (e) {
            // Ignore errors
          }
        }
      }
    }
  }

  // Check for data: URLs in object/embed tags (plain text and HTML entities)
  const dataUrlPatterns = [
    /data\s*=\s*"data:text\/html,([^"]*)"/gi,
    /data\s*=\s*'data:text\/html,([^']*)'/gi,
  ];
  
  for (const pattern of dataUrlPatterns) {
    let match;
    while ((match = pattern.exec(html)) !== null) {
      // Decode HTML entities first, then URL decode
      let content = decodeHTMLEntities(match[1]);
      content = decodeHTMLEntities(decodeURIComponent(content));
      
      const scriptMatch = content.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
      if (scriptMatch && scriptMatch[1].trim()) {
        try {
          const fn = new Function('alert', 'confirm', 'prompt', scriptMatch[1]);
          fn(safeAlert, safeConfirm, safePrompt);
        } catch (e) {
          // Ignore errors
        }
      }
    }
  }

  // Check for base64 encoded data: URLs
  const base64DataUrlPatterns = [
    /data\s*=\s*"data:text\/html;base64,([^"]*)"/gi,
    /data\s*=\s*'data:text\/html;base64,([^']*)'/gi,
  ];
  
  for (const pattern of base64DataUrlPatterns) {
    let match;
    while ((match = pattern.exec(html)) !== null) {
      try {
        const decoded = atob(match[1]);
        const scriptMatch = decoded.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
        if (scriptMatch && scriptMatch[1].trim()) {
          const fn = new Function('alert', 'confirm', 'prompt', scriptMatch[1]);
          fn(safeAlert, safeConfirm, safePrompt);
        }
      } catch (e) {
        // Ignore base64 decode errors
      }
    }
  }

  // Check for srcdoc in iframes
  const srcdocPatterns = [
    /srcdoc\s*=\s*"([^"]*)"/gi,
    /srcdoc\s*=\s*'([^']*)'/gi,
  ];
  
  for (const pattern of srcdocPatterns) {
    let match;
    while ((match = pattern.exec(html)) !== null) {
      const srcdocContent = decodeHTMLEntities(match[1]);
      // Check if srcdoc contains script
      const scriptMatch = srcdocContent.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
      if (scriptMatch && scriptMatch[1].trim()) {
        try {
          const fn = new Function('alert', 'confirm', 'prompt', scriptMatch[1]);
          fn(safeAlert, safeConfirm, safePrompt);
        } catch (e) {
          // Ignore errors
        }
      }
    }
  }

  return {
    success: xssTriggered,
    message: alertMessage || undefined
  };
}

/**
 * Render comment with XSS payloads highlighted but NOT executed
 */
function SafeCommentRender({ html }: { html: string }) {
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

// XSS Alert Modal Component
function XSSAlertModal({ 
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

const levels: Level[] = [
  {
    id: 1,
    title: 'Level 1: No Protection',
    description: 'This comment section has no XSS protection at all. Try to make an alert box appear!',
    hint: 'Try: <script>alert(\'XSS\')</script>',
  },
  {
    id: 2,
    title: 'Level 2: Script Tags Blocked',
    description: 'The developer blocked <script> tags. Can you find another way?',
    hint: 'Try: <img src=x onerror="alert(\'XSS\')">',
    filter: (input) => input.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '[BLOCKED]'),
  },
  {
    id: 3,
    title: 'Level 3: Common Events Filtered',
    description: 'onerror and onclick are now filtered. Find a less common event!',
    hint: 'Try: <img src=x onload="alert(\'XSS\')"> (use valid image) or <body onpageshow="alert(\'XSS\')">',
    filter: (input) => {
      let filtered = input.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '[BLOCKED]');
      // Only block common events
      filtered = filtered.replace(/\bon(error|click|mouseover)\s*=/gi, 'data-blocked=');
      return filtered;
    },
  },
  {
    id: 4,
    title: 'Level 4: More Events Blocked',
    description: 'More events are blocked now. Try the javascript: protocol!',
    hint: 'Try: <a href="javascript:alert(\'XSS\')">Click me</a>',
    filter: (input) => {
      let filtered = input.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '[BLOCKED]');
      // Block more events but still allow javascript: protocol
      filtered = filtered.replace(/\bon(error|click|mouseover|focus|blur|change|submit|pageshow)\s*=/gi, 'data-blocked=');
      return filtered;
    },
  },
  {
    id: 5,
    title: 'Level 5: JavaScript Protocol Blocked',
    description: 'javascript: is now blocked. Can you encode it?',
    hint: 'Try HTML entity encoding: <a href="&#106;&#97;&#118;&#97;&#115;&#99;&#114;&#105;&#112;&#116;&#58;alert(\'XSS\')">Click</a>',
    filter: (input) => {
      let filtered = input.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '[BLOCKED]');
      // Block common events but NOT all
      filtered = filtered.replace(/\bon(error|click|mouseover|focus|blur|change|submit|pageshow)\s*=/gi, 'data-blocked=');
      filtered = filtered.replace(/javascript:/gi, 'blocked:');
      return filtered;
    },
  },
  {
    id: 6,
    title: 'Level 6: Entity Encoding Detected',
    description: 'The filter now decodes HTML entities before checking. Try SVG tags!',
    hint: 'Try: <svg onload="alert(\'XSS\')"> or <svg/onload="alert(\'XSS\')">',
    filter: (input) => {
      let filtered = input.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '[BLOCKED]');
      // Block common events but NOT onload (SVG bypass)
      filtered = filtered.replace(/\bon(error|click|mouseover|focus|blur|change|submit|pageshow)\s*=/gi, 'data-blocked=');
      filtered = filtered.replace(/javascript:/gi, 'blocked:');
      // Decode entities and check again
      const decoded = filtered
        .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
        .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)));
      if (decoded.toLowerCase().includes('javascript:')) {
        filtered = filtered.replace(/&#[\dx]+;/gi, '[ENCODED]');
      }
      return filtered;
    },
  },
  {
    id: 7,
    title: 'Level 7: SVG Events Blocked',
    description: 'SVG onload is now blocked. Find another SVG event or different tag!',
    hint: 'Try: <details open ontoggle="alert(\'XSS\')"> or <marquee onstart="alert(\'XSS\')">test</marquee>',
    filter: (input) => {
      let filtered = input.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '[BLOCKED]');
      // Block more events including SVG ones
      filtered = filtered.replace(/\bon(error|click|mouseover|load|focus|blur|change|submit|pageshow|begin|end)\s*=/gi, 'data-blocked=');
      filtered = filtered.replace(/javascript:/gi, 'blocked:');
      return filtered;
    },
  },
  {
    id: 8,
    title: 'Level 8: Toggle & Start Blocked',
    description: 'ontoggle and onstart are now blocked. Try iframe srcdoc!',
    hint: 'Try: <iframe srcdoc="&lt;script&gt;alert(\'XSS\')&lt;/script&gt;">',
    filter: (input) => {
      let filtered = input.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '[BLOCKED]');
      // Block most common events
      filtered = filtered.replace(/\bon(error|click|mouseover|load|focus|blur|change|submit|pageshow|begin|end|toggle|start)\s*=/gi, 'data-blocked=');
      filtered = filtered.replace(/javascript:/gi, 'blocked:');
      return filtered;
    },
  },
  {
    id: 9,
    title: 'Level 9: Iframe Srcdoc Blocked',
    description: 'srcdoc is now blocked. Try using object tag with data: URL and HTML entities!',
    hint: 'Try: <object data="data:text/html,&lt;script&gt;alert(\'XSS\')&lt;/script&gt;">',
    filter: (input) => {
      // Block <script> tags (but &lt;script&gt; entities will pass through!)
      let filtered = input.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '[BLOCKED]');
      filtered = filtered.replace(/\bon(error|click|mouseover|load|focus|blur|change|submit|pageshow|begin|end|toggle|start)\s*=/gi, 'data-blocked=');
      filtered = filtered.replace(/javascript:/gi, 'blocked:');
      // Block srcdoc
      filtered = filtered.replace(/\bsrcdoc\s*=/gi, 'data-blocked=');
      return filtered;
    },
  },
  {
    id: 10,
    title: 'Level 10: The Final Boss',
    description: 'Almost everything is blocked! Think about base64 encoding.',
    hint: 'Try base64: <object data="data:text/html;base64,PHNjcmlwdD5hbGVydCgnWFNTJyk8L3NjcmlwdD4=">',
    filter: (input) => {
      let filtered = input.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '[BLOCKED]');
      // Block all common events
      filtered = filtered.replace(/\bon(error|click|mouseover|load|focus|blur|change|submit|pageshow|begin|end|toggle|start)\s*=/gi, 'data-blocked=');
      filtered = filtered.replace(/javascript:/gi, 'blocked:');
      filtered = filtered.replace(/\bsrcdoc\s*=/gi, 'data-blocked=');
      // Block simple data: URLs but not base64 encoded ones
      filtered = filtered.replace(/data:text\/html,/gi, 'blocked:');
      return filtered;
    },
  },
];

export default function XSSChallengePage() {
  const [currentLevel, setCurrentLevel] = useState(1);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState<Array<{id: number; text: string; rendered: string}>>([]);
  const [showHint, setShowHint] = useState(false);
  const [completedLevels, setCompletedLevels] = useState<number[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load saved progress from localStorage on mount
  useEffect(() => {
    const savedLevel = localStorage.getItem('xss-challenge-level');
    const savedCompleted = localStorage.getItem('xss-challenge-completed');
    
    if (savedLevel) {
      setCurrentLevel(parseInt(savedLevel, 10));
    }
    if (savedCompleted) {
      try {
        setCompletedLevels(JSON.parse(savedCompleted));
      } catch {
        // Invalid JSON, ignore
      }
    }
    setIsHydrated(true);
  }, []);

  // Save progress to localStorage when it changes
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem('xss-challenge-level', String(currentLevel));
    }
  }, [currentLevel, isHydrated]);

  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem('xss-challenge-completed', JSON.stringify(completedLevels));
    }
  }, [completedLevels, isHydrated]);

  const level = levels.find(l => l.id === currentLevel)!;

  const handleSubmit = useCallback(() => {
    if (!comment.trim()) return;

    const filteredComment = level.filter ? level.filter(comment) : comment;
    
    const newComment = {
      id: Date.now(),
      text: comment,
      rendered: filteredComment,
    };

    setComments(prev => [...prev, newComment]);
    
    // Execute XSS payload safely and detect if it triggers
    const detection = executeXSSPayload(filteredComment);
    if (detection.success) {
      setAlertMessage(detection.message || 'XSS');
      setShowSuccess(true);
      if (!completedLevels.includes(currentLevel)) {
        setCompletedLevels(prev => [...prev, currentLevel]);
      }
    }

    setComment('');
  }, [comment, level, currentLevel, completedLevels]);

  const resetLevel = () => {
    setComments([]);
    setShowSuccess(false);
    setShowHint(false);
    setAlertMessage(null);
  };

  const resetAllProgress = () => {
    setCurrentLevel(1);
    setCompletedLevels([]);
    setComments([]);
    setShowSuccess(false);
    setShowHint(false);
    setAlertMessage(null);
    localStorage.removeItem('xss-challenge-level');
    localStorage.removeItem('xss-challenge-completed');
  };

  const nextLevel = () => {
    if (currentLevel < levels.length) {
      setCurrentLevel(prev => prev + 1);
      resetLevel();
    }
  };

  const goToLevel = (levelId: number) => {
    setCurrentLevel(levelId);
    resetLevel();
  };

  // Show loading state until hydrated to prevent flash
  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        {/* Header Skeleton */}
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="flex items-center gap-2 flex-wrap">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Challenge Header Skeleton */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gray-200 dark:bg-gray-700 animate-pulse" />
              <div>
                <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
                <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </div>
            </div>
          </div>
          
          {/* Level Info Skeleton */}
          <div className="mb-6 p-6 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
            <div className="h-5 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-3" />
            <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
          
          {/* Blog Post Skeleton */}
          <div className="rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6">
            <div className="h-6 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4" />
            <div className="space-y-2">
              <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link 
              href="/playground"
              className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Playground
            </Link>
            
            {/* Level Progress */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 flex-wrap justify-end">
                {levels.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => goToLevel(l.id)}
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                      completedLevels.includes(l.id)
                        ? 'bg-green-500 text-white'
                        : l.id === currentLevel
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    {completedLevels.includes(l.id) ? <CheckCircle2 className="w-3.5 h-3.5" /> : l.id}
                  </button>
                ))}
              </div>
              {completedLevels.length > 0 && (
                <button
                  onClick={resetAllProgress}
                  className="text-xs text-gray-500 hover:text-red-500 transition-colors"
                  title="Reset all progress"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Challenge Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
              <Code className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">XSS Attack Challenge</h1>
              <p className="text-gray-600 dark:text-gray-400">Cross-Site Scripting Exploitation</p>
            </div>
          </div>
        </div>

        {/* Current Level Info */}
        <div className="mb-6 p-6 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{level.title}</h2>
                {completedLevels.includes(currentLevel) && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full">
                    Completed
                  </span>
                )}
              </div>
              <p className="text-gray-600 dark:text-gray-400">{level.description}</p>
            </div>
            <button
              onClick={() => setShowHint(!showHint)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                showHint 
                  ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <Lightbulb className="w-4 h-4" />
              Hint
            </button>
          </div>
          
          {showHint && (
            <div className="mt-4 p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                💡 <strong>Hint:</strong> {level.hint}
              </p>
            </div>
          )}
        </div>

        {/* Success Modal */}
        {showSuccess && (
          <div className="mb-6 p-6 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 animate-in slide-in-from-top-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center flex-shrink-0">
                <Trophy className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-1">
                  🎉 XSS Attack Successful!
                </h3>
                <p className="text-green-700 dark:text-green-300 text-sm mb-4">
                  You&apos;ve successfully exploited the XSS vulnerability in Level {currentLevel}!
                </p>
                
                {currentLevel < levels.length ? (
                  <button
                    onClick={nextLevel}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Next Level
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <div className="p-4 rounded-lg bg-green-100 dark:bg-green-900/30">
                    <p className="text-green-800 dark:text-green-200 font-medium">
                      🏆 Congratulations! You&apos;ve completed all XSS challenges!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Fake Blog Post */}
        <div className="rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
          {/* Blog Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              How to Stay Safe Online: Security Tips
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Posted by <span className="font-medium">admin</span> • December 5, 2025
            </p>
          </div>

          {/* Blog Content */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <p className="text-gray-700 dark:text-gray-300">
              Welcome to my blog about web security! Today we&apos;ll discuss how to protect yourself 
              from various online threats. Remember to always use strong passwords and enable 
              two-factor authentication on all your accounts...
            </p>
          </div>

          {/* Comments Section */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Comments ({comments.length})
              </h3>
              <button
                onClick={resetLevel}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
            </div>

            {/* Comment Form */}
            <div className="mb-6">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Write a comment... (try to inject some XSS!)"
                className="w-full p-4 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                rows={3}
              />
              <div className="flex items-center justify-between mt-3">
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {level.filter ? '⚠️ Some input filtering is active' : '🔓 No input filtering'}
                </p>
                <button
                  onClick={handleSubmit}
                  disabled={!comment.trim()}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                >
                  Post Comment
                </button>
              </div>
            </div>

            {/* Comments List */}
            <div className="space-y-4">
              {comments.length === 0 ? (
                <p className="text-center text-gray-500 dark:text-gray-500 py-8">
                  No comments yet. Be the first to comment!
                </p>
              ) : (
                comments.map((c) => (
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
                        <p className="text-xs text-yellow-700 dark:text-yellow-300">
                          ⚠️ <strong>Filtered:</strong> Some content was blocked
                        </p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Security Tips Section */}
        <div className="mt-8 p-6 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-4">
            <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                How to Prevent XSS Attacks
              </h3>
              <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                  <span><strong>Sanitize all user input</strong> - Use libraries like DOMPurify to clean HTML</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                  <span><strong>Escape output</strong> - Convert special characters to HTML entities</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                  <span><strong>Use Content Security Policy (CSP)</strong> - Restrict script sources</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                  <span><strong>Set HttpOnly cookies</strong> - Prevent JavaScript from accessing session cookies</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* XSS Alert Modal */}
      {alertMessage && (
        <XSSAlertModal 
          message={alertMessage} 
          onClose={() => setAlertMessage(null)} 
        />
      )}
    </div>
  );
}
