import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import type {
    CVData,
    CVComponent,
    HeaderData,
    SummaryData,
    ExperienceData,
    EducationData,
    SkillsData,
    ProjectsData,
    CertificationsData,
    LanguagesData,
    ExperienceItem,
    EducationItem,
    ProjectItem,
    CertificationItem,
    LanguageItem,
    Link,
} from '@/lib/cv/types';
import { createComponent } from '@/lib/cv/utils';

/**
 * Markdown Parser - Converts Markdown to CV Data
 * Parses markdown text into structured CV data
 */

interface ASTNode {
    type: string;
    children?: ASTNode[];
    value?: string;
    depth?: number;
    url?: string;
}

export class MarkdownParser {
    /**
     * Main entry point - parse markdown into CV data
     */
    parseMarkdown(markdown: string, currentCV: CVData): CVData {
        try {
            const tree = unified()
                .use(remarkParse)
                .use(remarkGfm)
                .parse(markdown);

            const sections: CVComponent[] = [];
            let order = 0;

            // Track which nodes have been processed
            const processedIndices = new Set<number>();
            // Track node index for each section (for proper orphan insertion)
            const sectionNodeIndices: number[] = [];

            // Process the AST tree
            const nodes = (tree as any).children as ASTNode[];
            let i = 0;

            while (i < nodes.length) {
                const node = nodes[i];

                // Check for H1 (Header section)
                if (node.type === 'heading' && node.depth === 1) {
                    const headerResult = this.parseHeader(nodes, i);
                    if (headerResult.data) {
                        sectionNodeIndices.push(sections.length, i); // Store section index and node index
                        sections.push(createComponent('header', order++, headerResult.data));
                    }
                    
                    // Mark only nodes that were actually consumed by parseHeader
                    for (let j = i; j < i + headerResult.nodesConsumed; j++) {
                        processedIndices.add(j);
                    }
                    i += headerResult.nodesConsumed;
                    continue;
                }

                // Check for H2 sections
                if (node.type === 'heading' && node.depth === 2) {
                    const originalTitle = this.extractText(node).trim();
                    const headingText = originalTitle.toLowerCase();
                    const sectionNodes = this.getSectionNodes(nodes, i);
                    
                    // Mark H2 as processed
                    processedIndices.add(i);
                    
                    // Mark section content nodes as processed
                    const nextSectionIndex = this.skipToNextSection(nodes, i);
                    for (let j = i + 1; j < nextSectionIndex; j++) {
                        processedIndices.add(j);
                    }

                    if (headingText.includes('summary') || headingText.includes('objective') || headingText.includes('tóm tắt')) {
                        const summaryData = this.parseSummary(sectionNodes, originalTitle);
                        if (summaryData) {
                            sectionNodeIndices.push(sections.length, i);
                            sections.push(createComponent('summary', order++, summaryData));
                        } else {
                            // Summary keyword match but no valid data - create raw as fallback
                            const rawData = this.parseRaw(sectionNodes, originalTitle);
                            if (rawData) {
                                sectionNodeIndices.push(sections.length, i);
                                sections.push(createComponent('raw', order++, rawData));
                            }
                        }
                    } else if (headingText.includes('experience') || headingText.includes('kinh nghiệm')) {
                        const experienceData = this.parseExperience(sectionNodes, originalTitle);
                        if (experienceData) {
                            sectionNodeIndices.push(sections.length, i);
                            sections.push(createComponent('experience', order++, experienceData));
                        } else {
                            const rawData = this.parseRaw(sectionNodes, originalTitle);
                            if (rawData) {
                                sectionNodeIndices.push(sections.length, i);
                                sections.push(createComponent('raw', order++, rawData));
                            }
                        }
                    } else if (headingText.includes('education') || headingText.includes('học vấn')) {
                        const educationData = this.parseEducation(sectionNodes, originalTitle);
                        if (educationData) {
                            sectionNodeIndices.push(sections.length, i);
                            sections.push(createComponent('education', order++, educationData));
                        } else {
                            const rawData = this.parseRaw(sectionNodes, originalTitle);
                            if (rawData) {
                                sectionNodeIndices.push(sections.length, i);
                                sections.push(createComponent('raw', order++, rawData));
                            }
                        }
                    } else if (headingText.includes('skill') || headingText.includes('kỹ năng')) {
                        const skillsData = this.parseSkills(sectionNodes, originalTitle);
                        if (skillsData) {
                            sectionNodeIndices.push(sections.length, i);
                            sections.push(createComponent('skills', order++, skillsData));
                        } else {
                            const rawData = this.parseRaw(sectionNodes, originalTitle);
                            if (rawData) {
                                sectionNodeIndices.push(sections.length, i);
                                sections.push(createComponent('raw', order++, rawData));
                            }
                        }
                    } else if (headingText.includes('project') || headingText.includes('dự án')) {
                        const projectsData = this.parseProjects(sectionNodes, originalTitle);
                        if (projectsData) {
                            sectionNodeIndices.push(sections.length, i);
                            sections.push(createComponent('projects', order++, projectsData));
                        } else {
                            const rawData = this.parseRaw(sectionNodes, originalTitle);
                            if (rawData) {
                                sectionNodeIndices.push(sections.length, i);
                                sections.push(createComponent('raw', order++, rawData));
                            }
                        }
                    } else if (headingText.includes('certification') || headingText.includes('chứng chỉ')) {
                        const certificationsData = this.parseCertifications(sectionNodes, originalTitle);
                        if (certificationsData) {
                            sectionNodeIndices.push(sections.length, i);
                            sections.push(createComponent('certifications', order++, certificationsData));
                        } else {
                            const rawData = this.parseRaw(sectionNodes, originalTitle);
                            if (rawData) {
                                sectionNodeIndices.push(sections.length, i);
                                sections.push(createComponent('raw', order++, rawData));
                            }
                        }
                    } else if (headingText.includes('language') || headingText.includes('ngôn ngữ')) {
                        const languagesData = this.parseLanguages(sectionNodes, originalTitle);
                        if (languagesData) {
                            sectionNodeIndices.push(sections.length, i);
                            sections.push(createComponent('languages', order++, languagesData));
                        } else {
                            const rawData = this.parseRaw(sectionNodes, originalTitle);
                            if (rawData) {
                                sectionNodeIndices.push(sections.length, i);
                                sections.push(createComponent('raw', order++, rawData));
                            }
                        }
                    } else {
                        // Unrecognized section - try to detect structure before falling back to raw
                        const detectedComponent = this.tryDetectComponentType(sectionNodes, originalTitle, order);
                        if (detectedComponent) {
                            sectionNodeIndices.push(sections.length, i);
                            sections.push(detectedComponent);
                            order++;
                        } else {
                            // Truly unrecognized - create raw component
                            const rawData = this.parseRaw(sectionNodes, originalTitle);
                            if (rawData) {
                                sectionNodeIndices.push(sections.length, i);
                                sections.push(createComponent('raw', order++, rawData));
                            }
                        }
                    }

                    i = this.skipToNextSection(nodes, i);
                    continue;
                }

                // Skip other node types (will be processed as orphan content later)
                i++;
            }

            // Collect ALL orphan content (unprocessed nodes)
            // This includes content before, between, and after sections
            const orphanGroups: { nodeIndex: number; nodes: ASTNode[] }[] = [];
            let currentOrphanGroup: ASTNode[] = [];
            let currentOrphanStart = -1;
            
            for (let j = 0; j < nodes.length; j++) {
                const node = nodes[j];
                
                // Skip processed nodes
                if (processedIndices.has(j)) {
                    // Save current orphan group if exists
                    if (currentOrphanGroup.length > 0) {
                        orphanGroups.push({
                            nodeIndex: currentOrphanStart,
                            nodes: [...currentOrphanGroup]
                        });
                        currentOrphanGroup = [];
                        currentOrphanStart = -1;
                    }
                    continue;
                }

                // Check for horizontal rule - this separates orphan groups
                if (node.type === 'thematicBreak') {
                    // Save current orphan group if exists
                    if (currentOrphanGroup.length > 0) {
                        orphanGroups.push({
                            nodeIndex: currentOrphanStart,
                            nodes: [...currentOrphanGroup]
                        });
                        currentOrphanGroup = [];
                        currentOrphanStart = -1;
                    }
                    
                    // Mark horizontal rule as processed
                    processedIndices.add(j);
                    continue;
                }

                // Collect unprocessed content nodes
                if (node.type === 'paragraph' || node.type === 'list' || node.type === 'blockquote' || node.type === 'code') {
                    if (currentOrphanStart === -1) {
                        currentOrphanStart = j;
                    }
                    currentOrphanGroup.push(node);
                }
            }
            
            // Don't forget last orphan group
            if (currentOrphanGroup.length > 0) {
                orphanGroups.push({
                    nodeIndex: currentOrphanStart,
                    nodes: [...currentOrphanGroup]
                });
            }

            // Insert orphan groups at correct positions
            // Calculate positions based on node indices, then sort by position and insert in reverse
            const orphanInsertions: { position: number; nodeIndex: number; component: CVComponent }[] = [];
            
            for (const group of orphanGroups) {
                const orphanContent = group.nodes.map(n => this.extractText(n)).join('\n\n').trim();
                if (orphanContent) {
                    // Find insertion position: count how many sections have nodeIndex < this orphan's nodeIndex
                    let insertPosition = 0;
                    
                    for (let i = 0; i < sectionNodeIndices.length; i += 2) {
                        const sectionNodeIdx = sectionNodeIndices[i + 1];
                        
                        // If section starts before this orphan, it should come before
                        if (sectionNodeIdx < group.nodeIndex) {
                            insertPosition++;
                        }
                    }
                    
                    const rawComponent = createComponent('raw', 0, {
                        title: '',
                        content: orphanContent
                    });
                    
                    orphanInsertions.push({ 
                        position: insertPosition, 
                        nodeIndex: group.nodeIndex,
                        component: rawComponent 
                    });
                }
            }
            
            // Sort by position descending to insert from end to start (avoid index shifting)
            orphanInsertions.sort((a, b) => {
                // If same position, preserve order by nodeIndex
                if (a.position === b.position) {
                    return b.nodeIndex - a.nodeIndex;
                }
                return b.position - a.position;
            });
            
            for (const insertion of orphanInsertions) {
                sections.splice(insertion.position, 0, insertion.component);
            }
            
            // Re-order all sections
            sections.forEach((s, idx) => s.order = idx);

            return {
                ...currentCV,
                sections,
                metadata: {
                    ...currentCV.metadata,
                    updatedAt: new Date().toISOString(),
                },
            };
        } catch (error) {
            console.error('Failed to parse markdown:', error);
            return currentCV;
        }
    }

    /**
     * Parse header section (H1 + contact info)
     * Returns header data and the number of nodes consumed
     */
    private parseHeader(nodes: ASTNode[], startIndex: number): { data: HeaderData | null; nodesConsumed: number } {
        try {
            const h1Node = nodes[startIndex];
            const name = this.extractText(h1Node);

            let title = '';
            let email = '';
            let phone = '';
            let location = '';
            const links: Link[] = [];
            let lastContactInfoIndex = startIndex; // Track last node that had contact info

            // Look at next few nodes for contact info
            for (let i = startIndex + 1; i < Math.min(startIndex + 5, nodes.length); i++) {
                const node = nodes[i];

                if (node.type === 'heading') break; // Stop at next heading

                if (node.type === 'paragraph') {
                    const text = this.extractText(node);
                    let foundContactInfo = false;

                    // Check for bold text (title)
                    if (node.children) {
                        const strongNode = node.children.find((c: ASTNode) => c.type === 'strong');
                        if (strongNode && !title) {
                            title = this.extractText(strongNode);
                            lastContactInfoIndex = i;
                            foundContactInfo = true;
                            continue;
                        }
                    }

                    // Extract contact info
                    // Strategy: Check if line contains pipe separators first
                    if (text.includes('|')) {
                        foundContactInfo = true;
                        // Pipe-separated format: email | phone | location
                        const parts = text.split('|').map(p => p.trim());

                        for (const part of parts) {
                            // Try to identify what each part is
                            // Email pattern
                            if (!email && part.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)) {
                                const emailMatch = part.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
                                if (emailMatch) email = emailMatch[1].trim();
                            }
                            // Phone pattern (must have at least 10 digits)
                            else if (!phone) {
                                const digitCount = part.replace(/\D/g, '').length;
                                if (digitCount >= 10 && digitCount <= 15) {
                                    // This looks like a phone number
                                    phone = part.trim();
                                }
                            }
                            // Location (doesn't contain @ or many digits)
                            else if (!location) {
                                const digitCount = part.replace(/\D/g, '').length;
                                if (!part.includes('@') && digitCount < 5) {
                                    location = part.trim();
                                }
                            }
                        }
                    } else {
                        // Non-pipe format: try emoji-based or standalone patterns
                        // Email: with emoji (📧 email@example.com) or without (email@example.com)
                        const emailWithEmoji = text.match(/📧\s*([^\s|]+@[^\s|]+)/);
                        const emailWithoutEmoji = text.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
                        if (emailWithEmoji) {
                            email = emailWithEmoji[1].trim();
                            foundContactInfo = true;
                        } else if (emailWithoutEmoji && !email) {
                            email = emailWithoutEmoji[1].trim();
                            foundContactInfo = true;
                        }

                        // Phone: with emoji (📱 +1 234...) 
                        const phoneWithEmoji = text.match(/📱\s*([^\n📧📍]+)/);
                        if (phoneWithEmoji) {
                            phone = phoneWithEmoji[1].trim();
                            foundContactInfo = true;
                        }

                        // Location: with emoji (📍 City, Country)
                        const locationWithEmoji = text.match(/📍\s*([^\n📧📱]+)/);
                        if (locationWithEmoji) {
                            location = locationWithEmoji[1].trim();
                            foundContactInfo = true;
                        } else if (!location && !text.includes('@')) {
                            // Standalone location line
                            const digitCount = text.replace(/\D/g, '').length;
                            if (digitCount < 5) {
                                location = text.trim();
                                foundContactInfo = true;
                            }
                        }
                    }

                    // Extract links
                    if (node.children) {
                        node.children.forEach((child: ASTNode) => {
                            if (child.type === 'link' && child.url) {
                                const label = this.extractText(child);
                                const type = this.inferLinkType(child.url, label);
                                links.push({ type, url: child.url, label });
                                foundContactInfo = true;
                            }
                        });
                    }
                    
                    // Update last contact info index if we found any
                    if (foundContactInfo) {
                        lastContactInfoIndex = i;
                    }
                }
            }

            const headerData: HeaderData = {
                name: name || 'Your Name',
                title: title || 'Your Title',
                email: email || 'your.email@example.com',
                phone: phone || '+1 (555) 000-0000',
                location: location || 'City, Country',
                links,
            };

            return {
                data: headerData,
                nodesConsumed: lastContactInfoIndex - startIndex + 1
            };
        } catch (error) {
            console.warn('Failed to parse header:', error);
            return { data: null, nodesConsumed: 1 };
        }
    }

    /**
     * Parse summary section
     */
    private parseSummary(nodes: ASTNode[], title?: string): SummaryData | null {
        try {
            const paragraphs = nodes.filter(n => n.type === 'paragraph');
            const content = paragraphs.map(p => this.extractText(p)).join('\n\n');

            return content ? { title, content } : null;
        } catch (error) {
            console.warn('Failed to parse summary:', error);
            return null;
        }
    }

    /**
     * Parse experience section
     */
    private parseExperience(nodes: ASTNode[], title?: string): ExperienceData | null {
        try {
            const items: ExperienceItem[] = [];
            let i = 0;

            while (i < nodes.length) {
                const node = nodes[i];

                if (node.type === 'heading' && node.depth === 3) {
                    const headerText = this.extractText(node);
                    // Support both @ and | separators
                    const match = headerText.match(/(.+?)\s*[@|]\s*(.+)/);

                    if (match) {
                        const position = match[1].trim();
                        const company = match[2].trim();

                        // Get metadata from next paragraph (location | dates or just dates)
                        let location = '';
                        let startDate = '2020-01';
                        let endDate: string | 'present' = 'present';

                        if (i + 1 < nodes.length && nodes[i + 1].type === 'paragraph') {
                            const metaText = this.extractText(nodes[i + 1]);
                            const parts = metaText.split('|').map(p => p.trim());

                            if (parts.length >= 2) {
                                // Has both location and dates: *Location | Jan 2020 - Present*
                                location = parts[0].replace(/\*/g, '').trim();
                                const dateRange = this.extractDateRange(parts[1]);
                                if (dateRange) {
                                    startDate = dateRange.startDate;
                                    endDate = dateRange.endDate;
                                }
                            } else if (parts.length === 1) {
                                // Only dates (no location): *2020 - Present*
                                const dateRange = this.extractDateRange(parts[0]);
                                if (dateRange) {
                                    startDate = dateRange.startDate;
                                    endDate = dateRange.endDate;
                                }
                            }
                        }

                        // Get description and highlights
                        let description = '';
                        const highlights: string[] = [];

                        for (let j = i + 2; j < nodes.length; j++) {
                            if (nodes[j].type === 'heading') break;

                            // Capture first paragraph as description (skip metadata line)
                            if (nodes[j].type === 'paragraph' && !description && j !== i + 1) {
                                description = this.extractText(nodes[j]);
                            }

                            // Capture bullet points
                            if (nodes[j].type === 'list') {
                                highlights.push(...this.extractListItems(nodes[j]));
                            }
                        }

                        items.push({
                            company,
                            position,
                            location,
                            startDate,
                            endDate,
                            description: description || undefined,
                            highlights,
                        });
                    }
                }

                i++;
            }

            return items.length > 0 ? { title, items } : null;
        } catch (error) {
            console.warn('Failed to parse experience:', error);
            return null;
        }
    }

    /**
     * Parse education section
     */
    private parseEducation(nodes: ASTNode[], title?: string): EducationData | null {
        try {
            const items: EducationItem[] = [];
            let i = 0;

            while (i < nodes.length) {
                const node = nodes[i];

                if (node.type === 'heading' && node.depth === 3) {
                    const headerText = this.extractText(node);
                    const match = headerText.match(/(.+?)\s+in\s+(.+)/);

                    if (match) {
                        const degree = match[1].trim();
                        const field = match[2].trim();

                        let institution = '';
                        let location = '';
                        let startDate = '2016-09';
                        let endDate: string | 'present' = '2020-05';
                        let gpa: string | undefined;
                        let honors: string[] | undefined;

                        // Get metadata from next paragraph
                        if (i + 1 < nodes.length && nodes[i + 1].type === 'paragraph') {
                            const metaText = this.extractText(nodes[i + 1]);
                            const parts = metaText.split('|').map(p => p.trim().replace(/\*/g, ''));

                            if (parts.length >= 1) institution = parts[0];
                            if (parts.length >= 2) location = parts[1];
                            if (parts.length >= 3) {
                                const dateRange = this.extractDateRange(parts[2]);
                                if (dateRange) {
                                    startDate = dateRange.startDate;
                                    endDate = dateRange.endDate;
                                }
                            }
                        }

                        // Look for GPA and honors
                        for (let j = i + 2; j < nodes.length; j++) {
                            if (nodes[j].type === 'heading') break;

                            const text = this.extractText(nodes[j]);
                            const gpaMatch = text.match(/GPA:\s*([0-9.\/]+)/);
                            if (gpaMatch) gpa = gpaMatch[1];

                            if (text.includes('Honors:') && nodes[j].type === 'paragraph') {
                                // Next node should be a list
                                if (j + 1 < nodes.length && nodes[j + 1].type === 'list') {
                                    honors = this.extractListItems(nodes[j + 1]);
                                }
                            }
                        }

                        items.push({
                            institution,
                            degree,
                            field,
                            location,
                            startDate,
                            endDate,
                            gpa,
                            honors,
                        });
                    }
                }

                i++;
            }

            // If no structured items found, capture raw content for fallback rendering
            if (items.length === 0) {
                const rawContent = nodes.map(n => this.extractText(n)).join('\n\n').trim();
                if (rawContent) {
                    return { title, items: [], rawContent };
                }
            }

            return items.length > 0 ? { title, items } : null;
        } catch (error) {
            console.warn('Failed to parse education:', error);
            return null;
        }
    }

    /**
     * Parse skills section
     */
    private parseSkills(nodes: ASTNode[], title?: string): SkillsData | null {
        try {
            const categories: { name: string; items: string[] }[] = [];

            for (const node of nodes) {
                if (node.type === 'paragraph') {
                    const text = this.extractText(node);
                    // Match pattern: "Category: item1, item2, item3"
                    const match = text.match(/^([A-Za-z\s]+):\s*(.+)$/m);

                    if (match) {
                        const name = match[1].trim();
                        const items = match[2].split(',').map(s => s.trim());
                        categories.push({ name, items });
                    }
                }
            }

            return categories.length > 0 ? { title, categories } : null;
        } catch (error) {
            console.warn('Failed to parse skills:', error);
            return null;
        }
    }

    /**
     * Parse projects section
     */
    private parseProjects(nodes: ASTNode[], title?: string): ProjectsData | null {
        try {
            const items: ProjectItem[] = [];
            let i = 0;

            while (i < nodes.length) {
                const node = nodes[i];

                if (node.type === 'heading' && node.depth === 3) {
                    let name = '';
                    let link: string | undefined;

                    // Check if heading contains a link
                    if (node.children && node.children[0]?.type === 'link') {
                        const linkNode = node.children[0];
                        name = this.extractText(linkNode);
                        link = linkNode.url;
                    } else {
                        name = this.extractText(node);
                    }

                    let technologies: string[] = [];
                    let description = '';
                    const highlights: string[] = [];

                    // Get technologies from next paragraph (italics)
                    if (i + 1 < nodes.length && nodes[i + 1].type === 'paragraph') {
                        const paraNode = nodes[i + 1];
                        if (paraNode.children && paraNode.children[0]?.type === 'emphasis') {
                            const techText = this.extractText(paraNode);
                            technologies = techText.split('•').map(t => t.trim()).filter(Boolean);
                        }
                    }

                    // Get description and highlights
                    for (let j = i + 2; j < nodes.length; j++) {
                        if (nodes[j].type === 'heading') break;

                        if (nodes[j].type === 'paragraph' && !description) {
                            description = this.extractText(nodes[j]);
                        }

                        if (nodes[j].type === 'list') {
                            highlights.push(...this.extractListItems(nodes[j]));
                        }
                    }

                    items.push({
                        name,
                        description,
                        technologies,
                        link,
                        highlights: highlights.length > 0 ? highlights : undefined,
                    });
                }

                i++;
            }

            // If no structured items found, capture raw content for fallback rendering
            if (items.length === 0) {
                const rawContent = nodes.map(n => this.extractText(n)).join('\n\n').trim();
                if (rawContent) {
                    return { title, items: [], rawContent };
                }
            }

            return items.length > 0 ? { title, items } : null;
        } catch (error) {
            console.warn('Failed to parse projects:', error);
            return null;
        }
    }

    /**
     * Parse certifications section
     */
    private parseCertifications(nodes: ASTNode[], title?: string): CertificationsData | null {
        try {
            const items: CertificationItem[] = [];
            let i = 0;

            while (i < nodes.length) {
                const node = nodes[i];

                if (node.type === 'heading' && node.depth === 3) {
                    let name = '';
                    let link: string | undefined;

                    if (node.children && node.children[0]?.type === 'link') {
                        const linkNode = node.children[0];
                        name = this.extractText(linkNode);
                        link = linkNode.url;
                    } else {
                        name = this.extractText(node);
                    }

                    let issuer = '';
                    let date = '2023-06';
                    let credentialId: string | undefined;

                    // Get metadata from next paragraph
                    if (i + 1 < nodes.length && nodes[i + 1].type === 'paragraph') {
                        const metaText = this.extractText(nodes[i + 1]);
                        const parts = metaText.split('|').map(p => p.trim().replace(/\*/g, ''));

                        if (parts.length >= 1) issuer = parts[0];
                        if (parts.length >= 2) {
                            const dateStr = parts[1];
                            const parsedDate = this.parseMonthYear(dateStr);
                            if (parsedDate) date = parsedDate;
                        }
                    }

                    // Look for credential ID
                    for (let j = i + 2; j < nodes.length; j++) {
                        if (nodes[j].type === 'heading') break;

                        const text = this.extractText(nodes[j]);
                        const credMatch = text.match(/Credential ID:\s*(.+)/);
                        if (credMatch) credentialId = credMatch[1].trim();
                    }

                    items.push({
                        name,
                        issuer,
                        date,
                        credentialId,
                        link,
                    });
                }

                i++;
            }

            // If no structured items found, capture raw content for fallback rendering
            if (items.length === 0) {
                const rawContent = nodes.map(n => this.extractText(n)).join('\n\n').trim();
                if (rawContent) {
                    return { title, items: [], rawContent };
                }
            }

            return items.length > 0 ? { title, items } : null;
        } catch (error) {
            console.warn('Failed to parse certifications:', error);
            return null;
        }
    }

    /**
     * Parse languages section
     */
    private parseLanguages(nodes: ASTNode[], title?: string): LanguagesData | null {
        try {
            const items: LanguageItem[] = [];

            for (const node of nodes) {
                if (node.type === 'list') {
                    const listItems = this.extractListItems(node);

                    for (const item of listItems) {
                        const match = item.match(/\*\*(.+?):\*\*\s*(.+)/);
                        if (match) {
                            items.push({
                                language: match[1].trim(),
                                proficiency: match[2].trim(),
                            });
                        }
                    }
                }
            }

            return items.length > 0 ? { title, items } : null;
        } catch (error) {
            console.warn('Failed to parse languages:', error);
            return null;
        }
    }

    /**
     * Try to detect component type from structure patterns
     * This helps match content that follows component format but has different section titles
     */
    private tryDetectComponentType(nodes: ASTNode[], title: string, order: number): CVComponent | null {
        try {
            // Check for experience pattern (H3 with @ or |, dates, bullets)
            const hasH3WithCompanyPattern = nodes.some(n => 
                n.type === 'heading' && 
                n.depth === 3 && 
                this.extractText(n).match(/[@|]/)
            );
            
            if (hasH3WithCompanyPattern) {
                const experienceData = this.parseExperience(nodes, title);
                if (experienceData && experienceData.items.length > 0) {
                    return createComponent('experience', order, experienceData);
                }
            }

            // Check for education pattern (H3 with institution, degree fields)
            const hasEducationPattern = nodes.some(n => {
                if (n.type === 'heading' && n.depth === 3) {
                    const text = this.extractText(n).toLowerCase();
                    return text.includes('university') || 
                           text.includes('college') || 
                           text.includes('institute') ||
                           text.includes('bachelor') ||
                           text.includes('master') ||
                           text.includes('phd') ||
                           text.includes('đại học');
                }
                return false;
            });
            
            if (hasEducationPattern) {
                const educationData = this.parseEducation(nodes, title);
                if (educationData && educationData.items.length > 0) {
                    return createComponent('education', order, educationData);
                }
            }

            // Check for projects pattern (H3 with links, technologies)
            const hasProjectPattern = nodes.some(n => {
                if (n.type === 'heading' && n.depth === 3) return true;
                if (n.type === 'paragraph') {
                    const text = this.extractText(n);
                    return text.includes('http') || text.includes('github') || text.includes('Technologies:');
                }
                return false;
            });
            
            if (hasProjectPattern) {
                const projectsData = this.parseProjects(nodes, title);
                if (projectsData && projectsData.items.length > 0) {
                    return createComponent('projects', order, projectsData);
                }
            }

            // Check for skills pattern (bullet lists or categories with items)
            const hasSkillsPattern = nodes.some(n => {
                if (n.type === 'list') {
                    const items = this.extractListItems(n);
                    return items.some(item => item.includes(':'));
                }
                if (n.type === 'paragraph') {
                    const text = this.extractText(n);
                    // Check for pattern "Category: items"
                    const hasColonPattern = text.match(/^[A-Za-z\s]+:\s*.+/);
                    
                    // Check if has strong child nodes (which indicates bold **Category:**)
                    const hasStrongChild = n.children && n.children.some((c: ASTNode) => c.type === 'strong');
                    
                    return hasColonPattern || hasStrongChild;
                }
                return false;
            });
            
            if (hasSkillsPattern) {
                const skillsData = this.parseSkills(nodes, title);
                if (skillsData && skillsData.categories && skillsData.categories.length > 0) {
                    return createComponent('skills', order, skillsData);
                }
            }

            // Check for certifications pattern (credential IDs, issuers)
            const hasCertPattern = nodes.some(n => {
                if (n.type === 'heading' && n.depth === 3) return true;
                if (n.type === 'paragraph') {
                    const text = this.extractText(n).toLowerCase();
                    return text.includes('issued by') || 
                           text.includes('credential') || 
                           text.includes('issuer') ||
                           text.includes('certification');
                }
                return false;
            });
            
            if (hasCertPattern) {
                const certificationsData = this.parseCertifications(nodes, title);
                if (certificationsData && certificationsData.items.length > 0) {
                    return createComponent('certifications', order, certificationsData);
                }
            }

            // Check for languages pattern (language: proficiency pairs)
            const hasLanguagePattern = nodes.some(n => {
                if (n.type === 'list') {
                    const items = this.extractListItems(n);
                    return items.some(item => {
                        const lower = item.toLowerCase();
                        return (lower.includes('native') || 
                                lower.includes('fluent') || 
                                lower.includes('professional') ||
                                lower.includes('conversational'));
                    });
                }
                return false;
            });
            
            if (hasLanguagePattern) {
                const languagesData = this.parseLanguages(nodes, title);
                if (languagesData && languagesData.items.length > 0) {
                    return createComponent('languages', order, languagesData);
                }
            }

            // Note: Summary is NOT detected here - it's only detected via keyword matching in main loop
            // This prevents "Hobbies" or other plain paragraph sections from being misclassified as Summary

            // No pattern matched
            return null;
        } catch (error) {
            console.warn('Failed to detect component type:', error);
            return null;
        }
    }

    /**
     * Parse raw/unrecognized section
     */
    private parseRaw(nodes: ASTNode[], title: string): { title: string; content: string } | null {
        try {
            const content = nodes.map(n => this.extractText(n)).join('\n\n').trim();
            return content ? { title, content } : null;
        } catch (error) {
            console.warn('Failed to parse raw section:', error);
            return null;
        }
    }

    // ===== Helper Methods =====

    /**
     * Extract plain text from AST node
     */
    private extractText(node: ASTNode): string {
        if (node.value) return node.value;

        if (node.children) {
            return node.children.map(child => this.extractText(child)).join('');
        }

        return '';
    }

    /**
     * Extract list items from list node
     */
    private extractListItems(node: ASTNode): string[] {
        if (node.type !== 'list' || !node.children) return [];

        return node.children.map(item => {
            if (item.type === 'listItem' && item.children) {
                return item.children.map(child => this.extractText(child)).join('').trim();
            }
            return '';
        }).filter(Boolean);
    }

    /**
     * Get all nodes belonging to a section (until next H2 or significant gap)
     * Stops at heading OR when encountering a significant line gap (2+ blank lines) OR horizontal rule
     */
    private getSectionNodes(nodes: ASTNode[], startIndex: number): ASTNode[] {
        const sectionNodes: ASTNode[] = [];
        let lastEndLine = (nodes[startIndex] as any).position?.end?.line || 0;

        for (let i = startIndex + 1; i < nodes.length; i++) {
            const node = nodes[i];
            
            // Stop at next heading
            if (node.type === 'heading' && node.depth === 2) break;

            // Stop at horizontal rule (---, ***, ___)
            if (node.type === 'thematicBreak') break;

            // Check for significant line gap (2+ blank lines between nodes)
            const currentStartLine = (node as any).position?.start?.line || lastEndLine + 1;
            const lineGap = currentStartLine - lastEndLine - 1;
            
            // If there's a gap of 2+ lines, stop collecting
            // This indicates user intentionally separated content
            if (lineGap >= 2 && sectionNodes.length > 0) {
                break;
            }

            sectionNodes.push(node);
            lastEndLine = (node as any).position?.end?.line || currentStartLine;
        }

        return sectionNodes;
    }

    /**
     * Skip to next section (next H2 or H1), respecting line gaps and horizontal rules
     */
    private skipToNextSection(nodes: ASTNode[], currentIndex: number): number {
        let lastEndLine = (nodes[currentIndex] as any).position?.end?.line || 0;
        
        for (let i = currentIndex + 1; i < nodes.length; i++) {
            const node = nodes[i];
            
            // Found next heading
            if (node.type === 'heading' && (node.depth === 1 || node.depth === 2)) {
                return i;
            }

            // Found horizontal rule - boundary marker
            if (node.type === 'thematicBreak') {
                // Return the index AFTER the thematicBreak so it's not processed again
                return i + 1;
            }

            // Check for significant line gap
            const currentStartLine = (node as any).position?.start?.line || lastEndLine + 1;
            const lineGap = currentStartLine - lastEndLine - 1;
            
            // If gap >= 2 blank lines, consider this the boundary
            if (lineGap >= 2 && i > currentIndex + 1) {
                return i;
            }
            
            lastEndLine = (node as any).position?.end?.line || currentStartLine;
        }
        
        return nodes.length;
    }

    /**
     * Extract date range from text like "Jan 2020 - Dec 2021" or "2020-01 - 2021-12"
     */
    private extractDateRange(text: string): { startDate: string; endDate: string | 'present' } | null {
        try {
            const cleanText = text.replace(/\*/g, '').trim();

            // Check for "present"
            const isPresent = /present/i.test(cleanText);

            // Try to extract dates
            const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
            const parts = cleanText.split('-').map(p => p.trim());

            if (parts.length >= 2) {
                const startPart = parts[0];
                const endPart = parts[1];

                // Parse start date
                let startDate = '2020-01';
                const startMatch = startPart.match(/(\w+)\s+(\d{4})/);
                if (startMatch) {
                    const monthIndex = monthNames.findIndex(m => startMatch[1].toLowerCase().startsWith(m));
                    if (monthIndex >= 0) {
                        startDate = `${startMatch[2]}-${String(monthIndex + 1).padStart(2, '0')}`;
                    }
                }

                // Parse end date
                let endDate: string | 'present' = 'present';
                if (!isPresent) {
                    const endMatch = endPart.match(/(\w+)\s+(\d{4})/);
                    if (endMatch) {
                        const monthIndex = monthNames.findIndex(m => endMatch[1].toLowerCase().startsWith(m));
                        if (monthIndex >= 0) {
                            endDate = `${endMatch[2]}-${String(monthIndex + 1).padStart(2, '0')}`;
                        }
                    }
                }

                return { startDate, endDate };
            }

            return null;
        } catch (error) {
            return null;
        }
    }

    /**
     * Parse month-year format like "Jun 2023" to "2023-06"
     */
    private parseMonthYear(text: string): string | null {
        try {
            const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
            const match = text.match(/(\w+)\s+(\d{4})/);

            if (match) {
                const monthIndex = monthNames.findIndex(m => match[1].toLowerCase().startsWith(m));
                if (monthIndex >= 0) {
                    return `${match[2]}-${String(monthIndex + 1).padStart(2, '0')}`;
                }
            }

            return null;
        } catch (error) {
            return null;
        }
    }

    /**
     * Infer link type from URL and label
     */
    private inferLinkType(url: string, label: string): Link['type'] {
        const lowerUrl = url.toLowerCase();
        const lowerLabel = label.toLowerCase();

        if (lowerUrl.includes('github.com') || lowerLabel.includes('github')) return 'github';
        if (lowerUrl.includes('linkedin.com') || lowerLabel.includes('linkedin')) return 'linkedin';
        if (lowerUrl.includes('twitter.com') || lowerLabel.includes('twitter')) return 'twitter';
        if (lowerUrl.startsWith('mailto:')) return 'email';
        if (lowerUrl.startsWith('tel:')) return 'phone';

        return 'website';
    }
}
