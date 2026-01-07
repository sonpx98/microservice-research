/**
 * CV Generator - Type Definitions
 * Core types for CV data structure and components
 */

// Component types available in CV
export type ComponentType =
    | 'header'
    | 'summary'
    | 'experience'
    | 'education'
    | 'skills'
    | 'projects'
    | 'certifications'
    | 'languages'
    | 'raw'
    | 'custom';

// Link types for contact information
export type LinkType = 'github' | 'linkedin' | 'website' | 'twitter' | 'email' | 'phone' | 'custom';

// Date format for experience/education
export interface DateRange {
    startDate: string; // YYYY-MM format
    endDate: string | 'present';
}

// Link structure
export interface Link {
    type: LinkType;
    url: string;
    label?: string;
}

// Header component data
export interface HeaderData {
    name: string;
    title: string;
    email: string;
    phone: string;
    location: string;
    links: Link[];
}

// Summary component data
export interface SummaryData {
    title?: string;
    content: string;
}

// Experience item
export interface ExperienceItem extends DateRange {
    company: string;
    position: string;
    location: string;
    description?: string;
    highlights: string[];
}

// Experience component data
export interface ExperienceData {
    title?: string;
    items: ExperienceItem[];
}

// Education item
export interface EducationItem extends DateRange {
    institution: string;
    degree: string;
    field: string;
    location: string;
    gpa?: string;
    honors?: string[];
}

// Education component data
export interface EducationData {
    title?: string;
    items: EducationItem[];
    rawContent?: string; // Fallback when structured parsing fails
}

// Skills category
export interface SkillCategory {
    name: string;
    items: string[];
}

// Skills component data
export interface SkillsData {
    title?: string;
    categories: SkillCategory[];
}

// Project item
export interface ProjectItem {
    name: string;
    description: string;
    technologies: string[];
    link?: string;
    highlights?: string[];
}

// Projects component data
export interface ProjectsData {
    title?: string;
    items: ProjectItem[];
    rawContent?: string; // Fallback when structured parsing fails
}

// Certification item
export interface CertificationItem {
    name: string;
    issuer: string;
    date: string; // YYYY-MM format
    credentialId?: string;
    link?: string;
}

// Certifications component data
export interface CertificationsData {
    title?: string;
    items: CertificationItem[];
    rawContent?: string; // Fallback when structured parsing fails
}

// Language item
export interface LanguageItem {
    language: string;
    proficiency: string; // e.g., "Native", "Fluent", "Professional", "Intermediate", "Basic"
}

// Languages component data
export interface LanguagesData {
    title?: string;
    items: LanguageItem[];
}

// Raw content component data - for unrecognized sections
export interface RawData {
    title: string;
    content: string;
}

// Base component interface
export interface CVComponent<T = any> {
    id: string;
    type: ComponentType;
    order: number;
    data: T;
    visible: boolean;
}

// CV metadata
export interface CVMetadata {
    id: string;
    createdAt: string;
    updatedAt: string;
    template: string;
    name?: string; // User-defined name for this CV
}

// Complete CV data structure
export interface CVData {
    version: string;
    metadata: CVMetadata;
    sections: CVComponent[];
}

// Template configuration
export interface TemplateStyles {
    colors: {
        primary: string;
        secondary: string;
        text: string;
        background: string;
    };
    fonts: {
        heading: string;
        body: string;
    };
    spacing: 'compact' | 'normal' | 'spacious';
}

export interface CVTemplate {
    id: string;
    name: string;
    description: string;
    preview?: string;
    styles: TemplateStyles;
}

// Component registry for drag & drop
export interface ComponentDefinition {
    type: ComponentType;
    name: string;
    icon: string; // Lucide icon name
    description: string;
    defaultData: any;
    category: 'basic' | 'advanced';
}

// Export formats
export type ExportFormat = 'pdf' | 'json' | 'markdown';

// Storage types
export interface StoredCV {
    id: string;
    name: string;
    updatedAt: string;
    preview?: string; // Base64 thumbnail
}
