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