/**
 * PDF Page Calculator - Estimates content capacity and overflow risk
 */

export interface PageCapacityInfo {
  totalCharacters: number;
  characterPerPage: number;
  estimatedPages: number;
  sections: SectionInfo[];
  warnings: string[];
}

export interface SectionInfo {
  title: string;
  characters: number;
  estimatedHeight: number; // in pixels
  riskLevel: 'safe' | 'warning' | 'danger'; // safe < 85%, warning 85-95%, danger > 95%
  willOverflow: boolean;
}

export class PDFPageCalculator {
  // PDF Letter size: 8.5" x 11" = 612 x 792 pixels at 72 DPI
  private static readonly PAGE_WIDTH = 612; // pixels
  private static readonly PAGE_HEIGHT = 792; // pixels
  private static readonly MARGIN_TOP = 40;
  private static readonly MARGIN_BOTTOM = 40;
  private static readonly MARGIN_LEFT = 60;
  private static readonly MARGIN_RIGHT = 60;
  
  // Available content area
  private static readonly AVAILABLE_WIDTH = this.PAGE_WIDTH - this.MARGIN_LEFT - this.MARGIN_RIGHT; // 492px
  private static readonly AVAILABLE_HEIGHT = this.PAGE_HEIGHT - this.MARGIN_TOP - this.MARGIN_BOTTOM; // 712px
  
  // Typography metrics (approximation)
  private static readonly FONT_SIZE = 16; // pixels (body text)
  private static readonly LINE_HEIGHT = 24; // pixels
  private static readonly AVG_CHAR_WIDTH = 8; // pixels (approximate for default font)
  
  /**
   * Calculate how many characters fit on one page
   */
  static calculateCharactersPerPage(): number {
    // Characters per line
    const charsPerLine = Math.floor(this.AVAILABLE_WIDTH / this.AVG_CHAR_WIDTH);
    
    // Lines per page
    const linesPerPage = Math.floor(this.AVAILABLE_HEIGHT / this.LINE_HEIGHT);
    
    // Total characters (with some buffer for headings, spacing)
    return Math.floor(charsPerLine * linesPerPage * 0.85); // 85% to account for headings, margins
  }

  /**
   * Estimate height of text based on character count and font metrics
   */
  static estimateTextHeight(text: string, fontSize: number = 16, lineHeight: number = 24): number {
    if (!text) return 0;
    
    const charsPerLine = Math.floor(this.AVAILABLE_WIDTH / (fontSize * 0.5)); // Approximate
    const lines = Math.ceil(text.length / charsPerLine);
    
    return lines * lineHeight;
  }

  /**
   * Detect sections that might overflow to next page
   */
  static analyzePageLayout(markdown: string): PageCapacityInfo {
    const sections = this.extractSections(markdown);
    const charPerPage = this.calculateCharactersPerPage();
    const totalCharacters = markdown.length;
    const estimatedPages = Math.ceil(totalCharacters / charPerPage);
    
    let currentPageHeight = 100; // Header takes ~100px
    let currentPageNum = 1;
    const analyzedSections: SectionInfo[] = [];
    const warnings: string[] = [];

    sections.forEach((section, index) => {
      // Estimate section height (heading + content)
      const headingHeight = 40; // h2 height
      const contentHeight = this.estimateTextHeight(section.content);
      const totalHeight = headingHeight + contentHeight + 20; // +20 for spacing

      // Check if section fits on current page
      const spaceLeftOnPage = this.AVAILABLE_HEIGHT - currentPageHeight;
      const willOverflow = totalHeight > spaceLeftOnPage;

      // Calculate risk level based on space usage
      const usagePercent = (currentPageHeight + totalHeight) / this.AVAILABLE_HEIGHT * 100;
      let riskLevel: 'safe' | 'warning' | 'danger' = 'safe';
      if (usagePercent > 95) {
        riskLevel = 'danger';
        warnings.push(`⚠️ Section "${section.title}" (${section.content.length} chars) might overflow - consider shortening content`);
      } else if (usagePercent > 85) {
        riskLevel = 'warning';
        warnings.push(`⚡ Section "${section.title}" is filling up page - watch for overflow`);
      }

      analyzedSections.push({
        title: section.title,
        characters: section.content.length,
        estimatedHeight: totalHeight,
        riskLevel,
        willOverflow
      });

      // Update page tracking
      if (willOverflow) {
        currentPageNum++;
        currentPageHeight = headingHeight + contentHeight + 20;
      } else {
        currentPageHeight += totalHeight;
      }
    });

    // Add general warning if too many pages
    if (estimatedPages > 2) {
      warnings.unshift(`📄 CV spans ${estimatedPages} pages - consider removing or shortening content`);
    }

    return {
      totalCharacters,
      characterPerPage: charPerPage,
      estimatedPages,
      sections: analyzedSections,
      warnings
    };
  }

  /**
   * Extract sections from markdown
   */
  private static extractSections(markdown: string): Array<{ title: string; content: string }> {
    const sections: Array<{ title: string; content: string }> = [];
    
    // Split by h2 (## Section)
    const parts = markdown.split(/^## /m);
    
    parts.forEach((part, index) => {
      if (index === 0 && part.trim()) {
        // Content before first h2 (header)
        sections.push({
          title: 'Header',
          content: part
        });
      } else if (part.trim()) {
        const lines = part.split('\n');
        const title = lines[0] || 'Unknown';
        const content = lines.slice(1).join('\n');
        
        sections.push({
          title,
          content
        });
      }
    });

    return sections;
  }

  /**
   * Get summary report
   */
  static getSummaryReport(markdown: string): string {
    const info = this.analyzePageLayout(markdown);
    
    let report = `📊 CV Page Analysis Report\n`;
    report += `===========================\n\n`;
    report += `📄 Estimated Pages: ${info.estimatedPages}\n`;
    report += `📝 Total Characters: ${info.totalCharacters.toLocaleString()}\n`;
    report += `📏 Characters per Page: ${info.characterPerPage.toLocaleString()}\n\n`;
    
    report += `📑 Section Breakdown:\n`;
    report += `-------------------\n`;
    
    info.sections.forEach((section, index) => {
      const riskIcon = section.riskLevel === 'danger' ? '🔴' : 
                       section.riskLevel === 'warning' ? '🟡' : '🟢';
      const overflowNote = section.willOverflow ? ' [MIGHT OVERFLOW]' : '';
      report += `${riskIcon} ${section.title}: ${section.characters} chars (${section.estimatedHeight.toFixed(0)}px)${overflowNote}\n`;
    });

    if (info.warnings.length > 0) {
      report += `\n⚠️  Warnings:\n`;
      report += `-----------\n`;
      info.warnings.forEach(w => {
        report += `${w}\n`;
      });
    } else {
      report += `\n✅ No warnings - Layout looks good!\n`;
    }

    return report;
  }
}
