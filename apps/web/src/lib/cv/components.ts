import type { ComponentDefinition, HeaderData, SummaryData, ExperienceData, SkillsData } from './types';

/**
 * Component Registry
 * Defines all available CV components with their default data
 */

export const COMPONENT_DEFINITIONS: Record<string, ComponentDefinition> = {
    header: {
        type: 'header',
        name: 'Header',
        icon: 'User',
        description: 'Name, title, and contact information',
        category: 'basic',
        defaultData: {
            name: 'Your Name',
            title: 'Your Title',
            email: 'your.email@example.com',
            phone: '+1 (555) 000-0000',
            location: 'City, Country',
            links: [
                { type: 'github', url: 'https://github.com/username' },
                { type: 'linkedin', url: 'https://linkedin.com/in/username' },
            ],
        } as HeaderData,
    },

    summary: {
        type: 'summary',
        name: 'Summary',
        icon: 'FileText',
        description: 'Professional summary or objective',
        category: 'basic',
        defaultData: {
            content: 'Write a brief professional summary highlighting your key skills and experience...',
        } as SummaryData,
    },

    experience: {
        type: 'experience',
        name: 'Experience',
        icon: 'Briefcase',
        description: 'Work experience and achievements',
        category: 'basic',
        defaultData: {
            items: [
                {
                    company: 'Company Name',
                    position: 'Your Position',
                    location: 'City, Country',
                    startDate: '2020-01',
                    endDate: 'present',
                    highlights: [
                        'Achievement or responsibility 1',
                        'Achievement or responsibility 2',
                        'Achievement or responsibility 3',
                    ],
                },
            ],
        } as ExperienceData,
    },

    skills: {
        type: 'skills',
        name: 'Skills',
        icon: 'Code',
        description: 'Technical and professional skills',
        category: 'basic',
        defaultData: {
            categories: [
                {
                    name: 'Languages',
                    items: ['JavaScript', 'TypeScript', 'Python'],
                },
                {
                    name: 'Frameworks',
                    items: ['React', 'Next.js', 'Node.js'],
                },
                {
                    name: 'Tools',
                    items: ['Git', 'Docker', 'AWS'],
                },
            ],
        } as SkillsData,
    },

    education: {
        type: 'education',
        name: 'Education',
        icon: 'GraduationCap',
        description: 'Educational background',
        category: 'basic',
        defaultData: {
            items: [
                {
                    institution: 'University Name',
                    degree: 'Bachelor of Science',
                    field: 'Computer Science',
                    location: 'City, Country',
                    startDate: '2016-09',
                    endDate: '2020-05',
                    gpa: '3.8/4.0',
                    honors: ['Dean\'s List', 'Cum Laude'],
                },
            ],
        },
    },

    projects: {
        type: 'projects',
        name: 'Projects',
        icon: 'FolderGit2',
        description: 'Personal or professional projects',
        category: 'advanced',
        defaultData: {
            items: [
                {
                    name: 'Project Name',
                    description: 'Brief description of the project and its impact',
                    technologies: ['React', 'Node.js', 'PostgreSQL'],
                    link: 'https://github.com/username/project',
                    highlights: [
                        'Key achievement or feature 1',
                        'Key achievement or feature 2',
                    ],
                },
            ],
        },
    },

    certifications: {
        type: 'certifications',
        name: 'Certifications',
        icon: 'Award',
        description: 'Professional certifications and licenses',
        category: 'advanced',
        defaultData: {
            items: [
                {
                    name: 'Certification Name',
                    issuer: 'Issuing Organization',
                    date: '2023-06',
                    credentialId: 'ABC123',
                    link: 'https://credential-url.com',
                },
            ],
        },
    },

    languages: {
        type: 'languages',
        name: 'Languages',
        icon: 'Languages',
        description: 'Spoken languages and proficiency',
        category: 'advanced',
        defaultData: {
            items: [
                { language: 'English', proficiency: 'Native' },
                { language: 'Spanish', proficiency: 'Professional' },
            ],
        },
    },

    raw: {
        type: 'raw',
        name: 'Raw Content',
        icon: 'FileCode',
        description: 'Custom content section',
        category: 'advanced',
        defaultData: {
            title: 'Custom Section',
            content: '',
        },
    },
};

/**
 * Get component definition by type
 */
export function getComponentDefinition(type: string): ComponentDefinition | undefined {
    return COMPONENT_DEFINITIONS[type];
}

/**
 * Get all basic components
 */
export function getBasicComponents(): ComponentDefinition[] {
    return Object.values(COMPONENT_DEFINITIONS).filter(c => c.category === 'basic');
}

/**
 * Get all advanced components
 */
export function getAdvancedComponents(): ComponentDefinition[] {
    return Object.values(COMPONENT_DEFINITIONS).filter(c => c.category === 'advanced');
}
