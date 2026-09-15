
import { LevelExplanation, XSSLevel } from "./types";

export const levelExplanations: Record<number, LevelExplanation> = {
  1: {
    attackName: 'Direct Script Injection',
    howItWorks: 'The attacker directly embeds a <script> tag in the user input. When the browser renders the HTML, it parses and executes the script immediately.',
    whyItSucceeds: 'There is no input filtering or validation. The application treats all user input as trusted HTML/JavaScript and renders it directly without sanitization.',
    realWorldImpact: 'Complete XSS vulnerability. Attackers can steal cookies, session tokens, perform actions on behalf of users, redirect to malicious sites, or deface the page.',
  },
  2: {
    attackName: 'Event Handler Injection',
    howItWorks: 'Instead of using <script> tags, the attacker uses HTML attributes like onerror on an <img> tag. When the image fails to load, the JavaScript in onerror executes.',
    whyItSucceeds: 'The filter only blocks <script> tags but doesn\'t check for event handlers like onerror, onclick, etc. Many HTML elements support event handlers.',
    realWorldImpact: 'Attackers can still execute arbitrary JavaScript through multiple vectors. This is a common bypass technique against basic filters.',
  },
  3: {
    attackName: 'Alternative Event Handler Bypass',
    howItWorks: 'Attackers use less common event handlers like onpageshow, onload, or onmouseenter. These fire automatically or with minimal user interaction.',
    whyItSucceeds: 'The filter only blocks onerror, onclick, and mouseover. It\'s impossible to block all event handlers - there are 100+ possible events in HTML.',
    realWorldImpact: 'Demonstrates that blacklisting specific events is ineffective. Attackers research browser documentation to find newer or obscure event handlers.',
  },
  4: {
    attackName: 'JavaScript Protocol Handler',
    howItWorks: 'The attacker uses javascript: as a URL protocol in href attributes. When the link is clicked, the JavaScript executes instead of navigating.',
    whyItSucceeds: 'More event handlers are now blocked, but javascript: protocol isn\'t. This is a valid URL protocol that browsers interpret as JavaScript execution.',
    realWorldImpact: 'JavaScript protocol can execute code without event handlers. It works in various contexts: links, iframes, and other elements with URL attributes.',
  },
  5: {
    attackName: 'HTML Entity Encoding Bypass',
    howItWorks: 'The attacker encodes the javascript: protocol using HTML entities (&#106;javascript:). The browser decodes these entities automatically when rendering.',
    whyItSucceeds: 'The filter blocks the literal string "javascript:" but doesn\'t account for encoded versions. Browsers decode entities before executing, bypassing the filter.',
    realWorldImpact: 'Many simple filters check for literal strings. Attackers use encoding (HTML entities, URL encoding, hex) to bypass pattern-based filters.',
  },
  6: {
    attackName: 'SVG Event Handler Injection',
    howItWorks: 'The attacker uses SVG (Scalable Vector Graphics) tags with event handlers. SVG is valid HTML5 and supports the same event handlers as regular elements.',
    whyItSucceeds: 'The filter now decodes entities and blocks javascript:, but forgets to block SVG elements. SVG provides another vector for code execution.',
    realWorldImpact: 'SVG is a powerful XSS vector because it\'s legitimate HTML5 content. Many blacklist filters forget about SVG, making it an effective bypass technique.',
  },
  7: {
    attackName: 'Obscure Event Handler Bypass',
    howItWorks: 'Attackers use newer or less documented event handlers like ontoggle (from <details> element) or onstart (animation events).',
    whyItSucceeds: 'SVG onload is now blocked, but the filter misses other event handlers introduced in HTML5 or newer specifications.',
    realWorldImpact: 'Shows that keeping up with all possible XSS vectors is impossible with blacklist approach. New HTML5 features continually introduce new attack vectors.',
  },
  8: {
    attackName: 'Iframe Srcdoc Attribute Injection',
    howItWorks: 'The attacker creates an <iframe> tag with a srcdoc attribute containing HTML/JavaScript. The srcdoc content is rendered inside the iframe without same-origin restrictions.',
    whyItSucceeds: 'Srcdoc is a less-known HTML5 attribute that allows embedding HTML directly. Most simple filters don\'t block it, and it creates an isolated execution context.',
    realWorldImpact: 'Iframes with srcdoc can execute JavaScript in a sandboxed context. This technique works even when many event handlers are blocked.',
  },
  9: {
    attackName: 'Data URL with HTML Entities',
    howItWorks: 'The attacker uses <object> tag with a data: URL containing embedded HTML/JavaScript. HTML entities are used to bypass filters (e.g., &lt;script&gt;).',
    whyItSucceeds: 'Srcdoc is blocked, but data: URLs aren\'t. The browser decodes HTML entities when loading data: URLs, allowing script execution.',
    realWorldImpact: 'Data URLs are a powerful XSS vector because they allow embedding any content type. Combined with entity encoding, they bypass many filters.',
  },
  10: {
    attackName: 'Base64-Encoded Data URL',
    howItWorks: 'The attacker encodes the JavaScript payload in base64 and uses it in a data: URL with ;base64 flag. The browser decodes and executes it.',
    whyItSucceeds: 'Simple data: URLs are blocked, but base64-encoded ones aren\'t. The filter focuses on detecting plaintext patterns but misses encoded payloads.',
    realWorldImpact: 'Base64 encoding defeats pattern-matching filters completely. This demonstrates that encoding-based bypasses are extremely difficult to defend against.',
  },
};

export const levels: XSSLevel[] = [
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