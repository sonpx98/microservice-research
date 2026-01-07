/**
 * PDF Export utility - converts markdown to print-friendly HTML
 */

export class PDFExporter {
  /**
   * Convert markdown to HTML suitable for printing
   */
  static markdownToHTML(markdown: string): string {
    let html = markdown;

    // Headers (must be before other replacements)
    html = html.replace(/^### (.*?)$/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.*?)$/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.*?)$/gm, '<h1>$1</h1>');

    // Horizontal rules (must be before italic replacement to avoid matching ***)
    // Only use *** for horizontal rules to avoid conflicts with --- in content
    html = html.replace(/^\*\*\*$/gm, '<hr />');

    // Links
    html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');

    // Bold (must be before italic to avoid conflicts)
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Italic (single asterisks, but not part of other patterns)
    html = html.replace(/\*([^\s*].*?[^\s*])\*/g, '<em>$1</em>');
    html = html.replace(/\*([^\s*])\*/g, '<em>$1</em>');

    // Process lines
    const lines = html.split('\n');
    const result: string[] = [];
    let inList = false;
    let listItems: string[] = [];
    let inParagraph = false;
    let paragraphContent: string[] = [];
    let inSection = false;
    let sectionContent: string[] = [];
    let inSubsection = false;
    let subsectionContent: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim();

      // Headers (h2 starts new section)
      if (trimmed.match(/^<h2>/)) {
        // Close previous subsection
        if (inSubsection && subsectionContent.length > 0) {
          sectionContent.push(`<div class="subsection">${subsectionContent.join('')}</div>`);
          subsectionContent = [];
          inSubsection = false;
        }
        // Close previous section
        if (inSection && sectionContent.length > 0) {
          result.push(`<div class="section">${sectionContent.join('')}</div>`);
          sectionContent = [];
        }
        // Close previous structures
        if (inParagraph) {
          if (subsectionContent.length > 0) {
            subsectionContent.push(`<p>${paragraphContent.join(' ')}</p>`);
          } else if (sectionContent.length > 0) {
            sectionContent.push(`<p>${paragraphContent.join(' ')}</p>`);
          } else {
            result.push(`<p>${paragraphContent.join(' ')}</p>`);
          }
          paragraphContent = [];
          inParagraph = false;
        }
        if (inList) {
          const ul = `<ul>${listItems.map((item) => `<li>${item}</li>`).join('')}</ul>`;
          if (subsectionContent.length > 0) {
            subsectionContent.push(ul);
          } else if (sectionContent.length > 0) {
            sectionContent.push(ul);
          } else {
            result.push(ul);
          }
          listItems = [];
          inList = false;
        }
        inSection = true;
        sectionContent.push(trimmed);
      }
      // H3 starts new subsection (within a section)
      else if (trimmed.match(/^<h3>/)) {
        // Close previous subsection
        if (inSubsection && subsectionContent.length > 0) {
          sectionContent.push(`<div class="subsection">${subsectionContent.join('')}</div>`);
          subsectionContent = [];
        }
        // Close previous structures
        if (inParagraph) {
          if (subsectionContent.length > 0) {
            subsectionContent.push(`<p>${paragraphContent.join(' ')}</p>`);
          } else if (sectionContent.length > 0) {
            sectionContent.push(`<p>${paragraphContent.join(' ')}</p>`);
          } else {
            result.push(`<p>${paragraphContent.join(' ')}</p>`);
          }
          paragraphContent = [];
          inParagraph = false;
        }
        if (inList) {
          const ul = `<ul>${listItems.map((item) => `<li>${item}</li>`).join('')}</ul>`;
          if (subsectionContent.length > 0) {
            subsectionContent.push(ul);
          } else if (sectionContent.length > 0) {
            sectionContent.push(ul);
          } else {
            result.push(ul);
          }
          listItems = [];
          inList = false;
        }
        inSubsection = true;
        subsectionContent.push(trimmed);
      }
      // H1 (don't start sections)
      else if (trimmed.match(/^<h1>/)) {
        // Close previous subsection
        if (inSubsection && subsectionContent.length > 0) {
          sectionContent.push(`<div class="subsection">${subsectionContent.join('')}</div>`);
          subsectionContent = [];
          inSubsection = false;
        }
        // Close previous section if h1 appears
        if (inSection && sectionContent.length > 0) {
          result.push(`<div class="section">${sectionContent.join('')}</div>`);
          sectionContent = [];
          inSection = false;
        }
        // Close previous structures
        if (inParagraph) {
          if (subsectionContent.length > 0) {
            subsectionContent.push(`<p>${paragraphContent.join(' ')}</p>`);
          } else if (sectionContent.length > 0) {
            sectionContent.push(`<p>${paragraphContent.join(' ')}</p>`);
          } else {
            result.push(`<p>${paragraphContent.join(' ')}</p>`);
          }
          paragraphContent = [];
          inParagraph = false;
        }
        if (inList) {
          const ul = `<ul>${listItems.map((item) => `<li>${item}</li>`).join('')}</ul>`;
          if (subsectionContent.length > 0) {
            subsectionContent.push(ul);
          } else if (sectionContent.length > 0) {
            sectionContent.push(ul);
          } else {
            result.push(ul);
          }
          listItems = [];
          inList = false;
        }
        result.push(trimmed);
      }
      // Horizontal rule (only ***)
      else if (trimmed === '***') {
        if (inParagraph) {
          if (subsectionContent.length > 0) {
            subsectionContent.push(`<p>${paragraphContent.join(' ')}</p>`);
          } else if (sectionContent.length > 0) {
            sectionContent.push(`<p>${paragraphContent.join(' ')}</p>`);
          } else {
            result.push(`<p>${paragraphContent.join(' ')}</p>`);
          }
          paragraphContent = [];
          inParagraph = false;
        }
        if (inList) {
          const ul = `<ul>${listItems.map((item) => `<li>${item}</li>`).join('')}</ul>`;
          if (subsectionContent.length > 0) {
            subsectionContent.push(ul);
          } else if (sectionContent.length > 0) {
            sectionContent.push(ul);
          } else {
            result.push(ul);
          }
          listItems = [];
          inList = false;
        }
        const hr = '<hr />';
        if (subsectionContent.length > 0) {
          subsectionContent.push(hr);
        } else if (sectionContent.length > 0) {
          sectionContent.push(hr);
        } else {
          result.push(hr);
        }
      }
      // Skip single asterisk lines completely
      else if (trimmed === '*') {
        // Do nothing - completely ignore single asterisks
        continue;
      }
      // List items
      else if (/^[-*]\s+\S/.test(trimmed)) {
        if (inParagraph) {
          if (subsectionContent.length > 0) {
            subsectionContent.push(`<p>${paragraphContent.join(' ')}</p>`);
          } else if (sectionContent.length > 0) {
            sectionContent.push(`<p>${paragraphContent.join(' ')}</p>`);
          } else {
            result.push(`<p>${paragraphContent.join(' ')}</p>`);
          }
          paragraphContent = [];
          inParagraph = false;
        }
        inList = true;
        const item = trimmed.replace(/^[-*]\s+/, '');
        listItems.push(item);
      }
      // Empty line
      else if (trimmed === '') {
        if (inParagraph) {
          if (subsectionContent.length > 0) {
            subsectionContent.push(`<p>${paragraphContent.join(' ')}</p>`);
          } else if (sectionContent.length > 0) {
            sectionContent.push(`<p>${paragraphContent.join(' ')}</p>`);
          } else {
            result.push(`<p>${paragraphContent.join(' ')}</p>`);
          }
          paragraphContent = [];
          inParagraph = false;
        }
        if (inList) {
          const ul = `<ul>${listItems.map((item) => `<li>${item}</li>`).join('')}</ul>`;
          if (subsectionContent.length > 0) {
            subsectionContent.push(ul);
          } else if (sectionContent.length > 0) {
            sectionContent.push(ul);
          } else {
            result.push(ul);
          }
          listItems = [];
          inList = false;
        }
      }
      // Regular content
      else if (trimmed) {
        if (inList) {
          const ul = `<ul>${listItems.map((item) => `<li>${item}</li>`).join('')}</ul>`;
          if (subsectionContent.length > 0) {
            subsectionContent.push(ul);
          } else if (sectionContent.length > 0) {
            sectionContent.push(ul);
          } else {
            result.push(ul);
          }
          listItems = [];
          inList = false;
        }
        if (inParagraph) {
          paragraphContent.push(trimmed);
        } else {
          inParagraph = true;
          paragraphContent = [trimmed];
        }
      }
    }

    // Close remaining structures
    if (inParagraph) {
      if (subsectionContent.length > 0) {
        subsectionContent.push(`<p>${paragraphContent.join(' ')}</p>`);
      } else if (sectionContent.length > 0) {
        sectionContent.push(`<p>${paragraphContent.join(' ')}</p>`);
      } else {
        result.push(`<p>${paragraphContent.join(' ')}</p>`);
      }
    }
    if (inList) {
      const ul = `<ul>${listItems.map((item) => `<li>${item}</li>`).join('')}</ul>`;
      if (subsectionContent.length > 0) {
        subsectionContent.push(ul);
      } else if (sectionContent.length > 0) {
        sectionContent.push(ul);
      } else {
        result.push(ul);
      }
    }
    if (inSubsection && subsectionContent.length > 0) {
      sectionContent.push(`<div class="subsection">${subsectionContent.join('')}</div>`);
    }
    if (inSection && sectionContent.length > 0) {
      result.push(`<div class="section">${sectionContent.join('')}</div>`);
    }

    return result.join('');
  }

  /**
   * Generate preview HTML document with multi-page layout (for modal preview)
   */
  static generatePreviewDocument(markdown: string, filename: string): string {
    const htmlContent = this.markdownToHTML(markdown);

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${filename} - Preview</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', sans-serif;
      line-height: 1.5;
      color: #333;
      background: #525659;
      padding: 20px;
      overflow-y: auto;
    }

    /* PDF viewer container */
    .pdf-viewer {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 20px;
      padding-bottom: 40px;
    }

    /* Individual page */
    .page {
      width: 8.5in;
      background: white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      padding: 0.5in;
      position: relative;
    }

    /* Hidden source content */
    #source {
      display: none;
    }

    /* Content styling - same as print dialog */
    h1 {
      font-size: 2.2em;
      font-weight: 700;
      margin-bottom: 0.3em;
      color: #000;
      letter-spacing: -0.5px;
    }

    h2 {
      font-size: 1.2em;
      font-weight: 600;
      margin-top: 1.2em;
      margin-bottom: 0.6em;
      padding-bottom: 0.4em;
      border-bottom: 2px solid #333;
      color: #000;
    }

    h3 {
      font-size: 1em;
      font-weight: 600;
      margin-top: 0.8em;
      margin-bottom: 0.3em;
      color: #000;
    }

    .section {
      margin-bottom: 1em;
    }

    .subsection {
      margin-bottom: 0.5em;
    }

    p {
      margin-bottom: 0.6em;
      line-height: 1.6;
    }

    ul, ol {
      margin-left: 1.5em;
      margin-bottom: 0.6em;
    }

    li {
      margin-bottom: 0.3em;
      line-height: 1.5;
    }

    strong {
      font-weight: 600;
      color: #000;
    }

    em {
      font-style: italic;
    }

    a {
      color: #0066cc;
      text-decoration: none;
    }

    hr {
      display: none;
    }
  </style>
</head>
<body>
  <!-- Hidden source content -->
  <div id="source">
    ${htmlContent}
  </div>
  
  <!-- PDF viewer with multiple pages -->
  <div class="pdf-viewer" id="pages"></div>
  
  <script>
    function createPages() {
      const source = document.getElementById('source');
      const pagesContainer = document.getElementById('pages');
      
      // Get all content elements
      const elements = Array.from(source.children);
      
      if (elements.length === 0) {
        // Fallback: create single page with all content
        const page = document.createElement('div');
        page.className = 'page';
        page.innerHTML = source.innerHTML;
        pagesContainer.appendChild(page);
        return;
      }
      
      // Constants
      const PAGE_HEIGHT_IN = 11;
      const PADDING_IN = 0.5;
      const DPI = 96;
      const PAGE_HEIGHT_PX = PAGE_HEIGHT_IN * DPI;
      const PADDING_PX = PADDING_IN * DPI * 2; // top + bottom
      const AVAILABLE_HEIGHT = PAGE_HEIGHT_PX - PADDING_PX;
      
      // Create first page
      let currentPage = document.createElement('div');
      currentPage.className = 'page';
      pagesContainer.appendChild(currentPage);
      let pageNumber = 1;
      
      // Distribute elements across pages
      elements.forEach((element, index) => {
        const clone = element.cloneNode(true);
        
        // Check if current page already has content BEFORE adding
        const hadContentBefore = currentPage.children.length > 0;
        
        // Temporarily add to measure
        currentPage.appendChild(clone);
        
        // Check if adding this element causes overflow
        const currentHeight = currentPage.scrollHeight;
        const willOverflow = currentHeight > AVAILABLE_HEIGHT;
        
        // Check if element can be moved to new page
        const isMovable = element.classList.contains('section') || 
                         element.classList.contains('subsection') ||
                         element.tagName === 'H2';
        
        // Only create new page if:
        // 1. Will overflow after adding this element
        // 2. Current page ALREADY HAD content before we added this element
        // 3. Element is movable (section/subsection)
        if (willOverflow && hadContentBefore && isMovable) {
          // Remove from current page
          currentPage.removeChild(clone);
          
          // Create new page
          currentPage = document.createElement('div');
          currentPage.className = 'page';
          pagesContainer.appendChild(currentPage);
          pageNumber++;
          
          // Add to new page
          currentPage.appendChild(clone);
        }
      });
      });
      
      // Remove empty pages
      const pages = pagesContainer.querySelectorAll('.page');
      pages.forEach(page => {
        if (page.children.length === 0) {
          page.remove();
        }
      });
    }
    
    // Run on load
    window.addEventListener('load', () => {
      requestAnimationFrame(() => {
        createPages();
      });
    });
  </script>
</body>
</html>`;
  }

  /**
   * Generate printable HTML document (for actual PDF export)
   * Keep original CSS to preserve page breaks
   */
  static generatePrintDocument(markdown: string, filename: string): string {
    const htmlContent = this.markdownToHTML(markdown);

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${filename}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', sans-serif;
      line-height: 1.5;
      color: #333;
      background: white;
    }

    .container {
      max-width: 8.5in;
      height: 11in;
      margin: 0 auto;
      padding: 40px 60px;
      background: white;
      box-shadow: 0 0 10px rgba(0,0,0,0.1);
    }

    h1 {
      font-size: 2.2em;
      font-weight: 700;
      margin-bottom: 0.3em;
      color: #000;
      letter-spacing: -0.5px;
      break-after: avoid;
      page-break-after: avoid;
    }

    h2 {
      font-size: 1.2em;
      font-weight: 600;
      margin-top: 1.2em;
      margin-bottom: 0.6em;
      padding-bottom: 0.4em;
      border-bottom: 2px solid #333;
      color: #000;
      page-break-after: avoid;
    }

    h3 {
      font-size: 1em;
      font-weight: 600;
      margin-top: 0.8em;
      margin-bottom: 0.3em;
      color: #000;
      break-after: avoid;
      page-break-after: avoid;
    }

    /* Section grouping - keep sections together on same page */
    .section {
      break-inside: avoid;
      page-break-inside: avoid;
      margin-bottom: 1em;
    }

    p {
      margin-bottom: 0.6em;
      line-height: 1.6;
      orphans: 3;
      widows: 3;
      break-inside: avoid;
    }

    ul, ol {
      margin-left: 1.5em;
      margin-bottom: 0.6em;
      break-inside: avoid;
      page-break-inside: avoid;
    }

    li {
      margin-bottom: 0.3em;
      line-height: 1.5;
      break-inside: avoid;
      page-break-inside: avoid;
    }

    strong {
      font-weight: 600;
      color: #000;
    }

    em {
      font-style: italic;
    }

    a {
      color: #0066cc;
      text-decoration: none;
    }

    a:hover {
      text-decoration: underline;
    }

    hr {
      display: none;
      border: none;
      margin: 0;
    }

    @media print {
      * {
        background: transparent !important;
        color: #000 !important;
        box-shadow: none !important;
        text-shadow: none !important;
      }

      html, body {
        width: 100%;
        height: 100%;
        margin: 0;
        padding: 0;
      }

      body {
        font-size: 12pt;
        line-height: 1.5;
      }

      .container {
        max-width: 100%;
        height: auto;
        margin: 0;
        padding: 0.5in;
        box-shadow: none;
        page-break-after: avoid;
      }

      h1, h2, h3, p, li, a, strong, em {
        page-break-inside: avoid;
      }

      a {
        color: #000 !important;
        text-decoration: none;
      }

      hr {
        border: none;
        border-top: 1px solid #000;
        margin: 0.5em 0;
        page-break-inside: avoid;
      }

      /* Hide header and footer in print */
      @page {
        margin: 0.5in;
        size: letter;
        @top-left {
          content: '';
        }
        @top-right {
          content: '';
        }
        @bottom-left {
          content: '';
        }
        @bottom-center {
          content: '';
        }
        @bottom-right {
          content: '';
        }
      }
    }
  </style>
</head>
<body>
  <div class="container">
    ${htmlContent}
  </div>
  <script>
    window.addEventListener('load', () => {
      setTimeout(() => {
        window.print();
      }, 500);
    });
  </script>
</body>
</html>`;
  }

  /**
   * Open print dialog with CV content using hidden iframe
   */
  static exportPDF(markdown: string, filename: string): void {
    try {
      const htmlContent = this.generatePrintDocument(markdown, filename);
      
      // Create hidden iframe
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.style.position = 'absolute';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = 'none';
      
      document.body.appendChild(iframe);
      
      // Function to cleanup iframe
      const cleanupIframe = () => {
        if (document.body.contains(iframe)) {
          try {
            document.body.removeChild(iframe);
          } catch (e) {
            // Already removed
          }
        }
      };
      
      // Write content to iframe
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc) {
        alert('Unable to create print document.');
        cleanupIframe();
        return;
      }
      
      iframeDoc.open();
      iframeDoc.write(htmlContent);
      iframeDoc.close();
      
      // Flag to track if we should cleanup
      let printInitiated = false;
      let cleanupScheduled = false;
      
      // Wait for content to load, then print
      iframe.onload = () => {
        setTimeout(() => {
          const iframeWindow = iframe.contentWindow;
          if (iframeWindow) {
            // Listen for afterprint event (when print is completed)
            iframeWindow.addEventListener('afterprint', () => {
              cleanupIframe();
            });
            
            // Listen for beforeprint to know print dialog opened
            iframeWindow.addEventListener('beforeprint', () => {
              printInitiated = true;
            });
          }
          
          iframeWindow?.print();
          
          // Schedule cleanup with delay - gives time for afterprint to fire
          if (!cleanupScheduled) {
            cleanupScheduled = true;
            setTimeout(() => {
              cleanupIframe();
            }, 10000); // 10 second timeout as fallback
          }
        }, 250);
      };
      
      // Also handle focus event - when user returns to page after print dialog closes
      const handleWindowFocus = () => {
        if (printInitiated) {
          setTimeout(() => {
            cleanupIframe();
            window.removeEventListener('focus', handleWindowFocus);
          }, 100);
        }
      };
      
      window.addEventListener('focus', handleWindowFocus);
      
      // Handle case where onload doesn't fire
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          const iframeWindow = iframe.contentWindow;
          if (iframeWindow) {
            iframeWindow.addEventListener('afterprint', () => {
              cleanupIframe();
              window.removeEventListener('focus', handleWindowFocus);
            });
            
            if (!printInitiated) {
              iframeWindow?.print();
              printInitiated = true;
            }
          }
          
          // Schedule cleanup
          if (!cleanupScheduled) {
            cleanupScheduled = true;
            setTimeout(() => {
              cleanupIframe();
              window.removeEventListener('focus', handleWindowFocus);
            }, 10000);
          }
        }
      }, 1000);
    } catch (error) {
      console.error('Failed to export PDF:', error);
      alert('Failed to export CV as PDF');
    }
  }
}
