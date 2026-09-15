import type {
    CVData,
    CVComponent,
    HeaderData,
    SummaryData,
    ExperienceData,
    SkillsData,
    EducationData,
    ProjectsData,
} from '@/lib/cv/types';
import { formatDateRange } from '@/lib/cv/utils';
import { MarkdownParser } from './markdown-parser';

/**
 * Code Generator - JSON to Markdown
 * Converts CV JSON data to Markdown format
 */

export class CodeGenerator {
    private parser: MarkdownParser;

    constructor() {
        this.parser = new MarkdownParser();
    }

    /**
     * Generate Markdown from CV data
     */
    generateMarkdown(cv: CVData): string {
        const sections = cv.sections
            .filter(s => s.visible)
            .sort((a, b) => a.order - b.order)
            .map(section => this.renderSection(section))
            .filter(s => s.trim().length > 0)
            .join('\n\n***\n\n'); // Use asterisks to avoid setext heading conflict

        return sections;
    }

    /**
     * Parse Markdown back to CV data
     */
    parseMarkdown(markdown: string, currentCV: CVData): CVData {
        try {
            return this.parser.parseMarkdown(markdown, currentCV);
        } catch (error) {
            console.error('Failed to parse markdown:', error);
            return currentCV; // Return unchanged CV on error
        }
    }

    /**
     * Render a single section based on its type
     */
    private renderSection(section: CVComponent): string {
        switch (section.type) {
            case 'header':
                return this.renderHeader(section.data as HeaderData);
            case 'summary':
                return this.renderSummary(section.data as SummaryData);
            case 'experience':
                return this.renderExperience(section.data as ExperienceData);
            case 'skills':
                return this.renderSkills(section.data as SkillsData);
            case 'education':
                return this.renderEducation(section.data as EducationData);
            case 'projects':
                return this.renderProjects(section.data as ProjectsData);
            case 'certifications':
                return this.renderCertifications(section.data);
            case 'languages':
                return this.renderLanguages(section.data);
            case 'raw':
                return this.renderRaw(section.data);
            default:
                return '';
        }
    }

    /**
     * Render header section
     */
    private renderHeader(data: HeaderData): string {
        const lines: string[] = [];

        // Name as H1
        lines.push(`# ${data.name}`);

        // Title in bold
        if (data.title) {
            lines.push(`**${data.title}**`);
            lines.push('');
        }

        // Contact info on one line
        const contacts: string[] = [];
        if (data.email) contacts.push(`📧 ${data.email}`);
        if (data.phone) contacts.push(`📱 ${data.phone}`);
        if (data.location) contacts.push(`📍 ${data.location}`);

        if (contacts.length > 0) {
            lines.push(contacts.join(' | '));
        }

        // Links
        if (data.links && data.links.length > 0) {
            const linkTexts = data.links.map(link => {
                const label = link.label || this.getLinkLabel(link.type);
                return `[${label}](${link.url})`;
            });
            lines.push(linkTexts.join(' | '));
        }

        return lines.join('\n');
    }

    /**
     * Render summary section
     */
    private renderSummary(data: SummaryData): string {
        if (!data.content) return '';

        return `## Summary\n\n${data.content}`;
    }

    /**
     * Render experience section
     */
    private renderExperience(data: ExperienceData): string {
        if (!data.items || data.items.length === 0) return '';

        const lines: string[] = ['## Experience', ''];

        data.items.forEach((item, index) => {
            // Position @ Company
            lines.push(`### ${item.position} @ ${item.company}`);

            // Location | Date range
            const meta: string[] = [];
            if (item.location) meta.push(item.location);
            meta.push(formatDateRange(item.startDate, item.endDate));
            lines.push(`*${meta.join(' | ')}*`);
            lines.push('');

            // Highlights as bullet points
            if (item.highlights && item.highlights.length > 0) {
                item.highlights.forEach(highlight => {
                    lines.push(`- ${highlight}`);
                });
            }

            // Add spacing between items (except last)
            if (index < data.items.length - 1) {
                lines.push('');
            }
        });

        return lines.join('\n');
    }

    /**
     * Render skills section
     */
    private renderSkills(data: SkillsData): string {
        if (!data.categories || data.categories.length === 0) return '';

        const lines: string[] = ['## Skills', ''];

        data.categories.forEach(category => {
            if (category.items && category.items.length > 0) {
                const skillsList = category.items.join(', ');
                lines.push(`**${category.name}:** ${skillsList}`);
            }
        });

        return lines.join('\n');
    }

    /**
     * Render education section
     */
    private renderEducation(data: EducationData): string {
        if (!data.items || data.items.length === 0) return '';

        const lines: string[] = ['## Education', ''];

        data.items.forEach((item, index) => {
            // Degree in Field
            lines.push(`### ${item.degree} in ${item.field}`);

            // Institution | Location | Date range
            const meta: string[] = [item.institution];
            if (item.location) meta.push(item.location);
            meta.push(formatDateRange(item.startDate, item.endDate));
            lines.push(`*${meta.join(' | ')}*`);
            lines.push('');

            // GPA
            if (item.gpa) {
                lines.push(`**GPA:** ${item.gpa}`);
                lines.push('');
            }

            // Honors
            if (item.honors && item.honors.length > 0) {
                lines.push('**Honors:**');
                item.honors.forEach(honor => {
                    lines.push(`- ${honor}`);
                });
            }

            // Add spacing between items (except last)
            if (index < data.items.length - 1) {
                lines.push('');
            }
        });

        return lines.join('\n');
    }

    /**
     * Render projects section
     */
    private renderProjects(data: ProjectsData): string {
        if (!data.items || data.items.length === 0) return '';

        const lines: string[] = ['## Projects', ''];

        data.items.forEach((item, index) => {
            // Project name (with link if available)
            if (item.link) {
                lines.push(`### [${item.name}](${item.link})`);
            } else {
                lines.push(`### ${item.name}`);
            }

            // Technologies
            if (item.technologies && item.technologies.length > 0) {
                lines.push(`*${item.technologies.join(' • ')}*`);
                lines.push('');
            }

            // Description
            if (item.description) {
                lines.push(item.description);
                lines.push('');
            }

            // Highlights
            if (item.highlights && item.highlights.length > 0) {
                item.highlights.forEach(highlight => {
                    lines.push(`- ${highlight}`);
                });
            }

            // Add spacing between items (except last)
            if (index < data.items.length - 1) {
                lines.push('');
            }
        });

        return lines.join('\n');
    }

    /**
     * Render certifications section
     */
    private renderCertifications(data: any): string {
        if (!data.items || data.items.length === 0) return '';

        const lines: string[] = ['## Certifications', ''];

        data.items.forEach((item: any, index: number) => {
            // Certification name (with link if available)
            if (item.link) {
                lines.push(`### [${item.name}](${item.link})`);
            } else {
                lines.push(`### ${item.name}`);
            }

            // Issuer and date
            const meta: string[] = [item.issuer];
            if (item.date) {
                const [year, month] = item.date.split('-');
                const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                meta.push(`${monthNames[parseInt(month) - 1]} ${year}`);
            }
            lines.push(`*${meta.join(' | ')}*`);

            // Credential ID
            if (item.credentialId) {
                lines.push(`**Credential ID:** ${item.credentialId}`);
            }

            // Add spacing between items (except last)
            if (index < data.items.length - 1) {
                lines.push('');
            }
        });

        return lines.join('\n');
    }

    /**
     * Render languages section
     */
    private renderLanguages(data: any): string {
        if (!data.items || data.items.length === 0) return '';

        const lines: string[] = ['## Languages', ''];

        data.items.forEach((item: any) => {
            lines.push(`- **${item.language}:** ${item.proficiency}`);
        });

        return lines.join('\n');
    }

    /**
     * Get human-readable label for link type
     */
    private getLinkLabel(type: string): string {
        const labels: Record<string, string> = {
            github: 'GitHub',
            linkedin: 'LinkedIn',
            website: 'Website',
            twitter: 'Twitter',
            email: 'Email',
            phone: 'Phone',
        };

        return labels[type] || type.charAt(0).toUpperCase() + type.slice(1);
    }

    /**
     * Render raw content section
     */
    private renderRaw(data: any): string {
        if (!data.content) return '';

        // If raw content has a title, render it as H2 section
        if (data.title) {
            return `## ${data.title}\n\n${data.content}`;
        }

        // If no title, render content directly
        // User should use *** to separate sections
        return data.content;
    }
}

// Export singleton instance
export const codeGenerator = new CodeGenerator();
