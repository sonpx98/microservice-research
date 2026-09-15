'use client';

import { useEffect } from 'react';

export function CodeBlockCopyButton() {
  useEffect(() => {
    // Inject styles for copy button
    const styleId = 'code-copy-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        .code-block-wrapper {
          position: relative;
        }
        .code-block-wrapper .copy-code-btn {
          position: absolute;
          top: 8px;
          right: 8px;
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 10px;
          font-size: 12px;
          font-weight: 500;
          color: #a1a1aa;
          background: rgba(39, 39, 42, 0.8);
          border: 1px solid rgba(63, 63, 70, 0.5);
          border-radius: 6px;
          cursor: pointer;
          opacity: 0;
          transform: translateY(-4px);
          transition: all 0.2s ease;
          backdrop-filter: blur(8px);
          z-index: 10;
        }
        .code-block-wrapper:hover .copy-code-btn {
          opacity: 1;
          transform: translateY(0);
        }
        .copy-code-btn:hover {
          color: #fafafa;
          background: rgba(63, 63, 70, 0.9);
          border-color: rgba(82, 82, 91, 0.8);
        }
        .copy-code-btn.copied {
          color: #4ade80;
          border-color: rgba(74, 222, 128, 0.3);
        }
        .copy-code-btn svg {
          width: 14px;
          height: 14px;
          flex-shrink: 0;
        }
        .copy-code-btn .label {
          line-height: 1;
        }
      `;
      document.head.appendChild(style);
    }

    // Find all code blocks and add copy buttons
    const addCopyButtons = () => {
      const codeBlocks = document.querySelectorAll('.prose pre');
      
      codeBlocks.forEach((pre, index) => {
        // Skip if already wrapped
        if (pre.parentElement?.classList.contains('code-block-wrapper')) return;
        
        // Create wrapper
        const wrapper = document.createElement('div');
        wrapper.className = 'code-block-wrapper';
        pre.parentNode?.insertBefore(wrapper, pre);
        wrapper.appendChild(pre);
        
        // Create copy button
        const button = document.createElement('button');
        button.className = 'copy-code-btn';
        button.setAttribute('aria-label', 'Copy code');
        button.innerHTML = `
          <svg class="copy-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
          </svg>
          <svg class="check-icon" style="display:none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          <span class="label">Copy</span>
        `;
        
        // Get code content
        const codeElement = pre.querySelector('code');
        const code = codeElement?.textContent || '';
        
        button.addEventListener('click', async (e) => {
          e.preventDefault();
          e.stopPropagation();
          
          try {
            await navigator.clipboard.writeText(code);
            
            // Toggle to copied state
            const copyIcon = button.querySelector('.copy-icon') as HTMLElement;
            const checkIcon = button.querySelector('.check-icon') as HTMLElement;
            const label = button.querySelector('.label') as HTMLElement;
            
            copyIcon.style.display = 'none';
            checkIcon.style.display = 'block';
            label.textContent = 'Copied!';
            button.classList.add('copied');
            
            // Reset after 2s
            setTimeout(() => {
              copyIcon.style.display = 'block';
              checkIcon.style.display = 'none';
              label.textContent = 'Copy';
              button.classList.remove('copied');
            }, 2000);
          } catch (err) {
            console.error('Failed to copy:', err);
          }
        });
        
        wrapper.appendChild(button);
      });
    };

    // Initial run
    addCopyButtons();
    
    // Watch for DOM changes (for streaming content)
    const observer = new MutationObserver(() => {
      addCopyButtons();
    });
    
    const prose = document.querySelector('.prose');
    if (prose) {
      observer.observe(prose, {
        childList: true,
        subtree: true,
      });
    }
    
    // Also run after delays for streaming content
    const timeout1 = setTimeout(addCopyButtons, 1000);
    const timeout2 = setTimeout(addCopyButtons, 3000);
    const timeout3 = setTimeout(addCopyButtons, 5000);

    return () => {
      observer.disconnect();
      clearTimeout(timeout1);
      clearTimeout(timeout2);
      clearTimeout(timeout3);
    };
  }, []);

  return null; // This component only adds behavior, no UI
}
