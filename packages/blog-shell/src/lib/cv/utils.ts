import { v4 as uuidv4 } from 'uuid';
import type { CVData, CVComponent, ComponentType, CVMetadata } from './types';

/**
 * Utility functions for CV Generator
 */

/**
 * Create a new empty CV with default metadata
 */
export function createEmptyCV(template: string = 'modern'): CVData {
    return {
        version: '1.0',
        metadata: {
            id: uuidv4(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            template,
        },
        sections: [],
    };
}

/**
 * Create a new CV component with default data
 */
export function createComponent(
    type: ComponentType,
    order: number,
    defaultData: any
): CVComponent {
    return {
        id: uuidv4(),
        type,
        order,
        data: defaultData,
        visible: true,
    };
}

/**
 * Update CV metadata timestamp
 */
export function updateCVTimestamp(cv: CVData): CVData {
    return {
        ...cv,
        metadata: {
            ...cv.metadata,
            updatedAt: new Date().toISOString(),
        },
    };
}

/**
 * Reorder sections after drag & drop
 */
export function reorderSections(
    sections: CVComponent[],
    fromIndex: number,
    toIndex: number
): CVComponent[] {
    const result = Array.from(sections);
    const [removed] = result.splice(fromIndex, 1);
    result.splice(toIndex, 0, removed);

    // Update order property
    return result.map((section, index) => ({
        ...section,
        order: index,
    }));
}

/**
 * Format date range for display
 */
export function formatDateRange(startDate: string, endDate: string | 'present'): string {
    const formatDate = (date: string) => {
        const [year, month] = date.split('-');
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${monthNames[parseInt(month) - 1]} ${year}`;
    };

    const start = formatDate(startDate);
    const end = endDate === 'present' ? 'Present' : formatDate(endDate);

    return `${start} - ${end}`;
}

/**
 * Calculate duration between dates
 */
export function calculateDuration(startDate: string, endDate: string | 'present'): string {
    const start = new Date(startDate);
    const end = endDate === 'present' ? new Date() : new Date(endDate);

    const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;

    if (years === 0) {
        return `${remainingMonths} ${remainingMonths === 1 ? 'month' : 'months'}`;
    } else if (remainingMonths === 0) {
        return `${years} ${years === 1 ? 'year' : 'years'}`;
    } else {
        return `${years} ${years === 1 ? 'year' : 'years'} ${remainingMonths} ${remainingMonths === 1 ? 'month' : 'months'}`;
    }
}

/**
 * Validate CV data structure
 */
export function validateCV(cv: CVData): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!cv.version) {
        errors.push('Missing version');
    }

    if (!cv.metadata?.id) {
        errors.push('Missing metadata.id');
    }

    if (!Array.isArray(cv.sections)) {
        errors.push('Sections must be an array');
    }

    // Validate each section has required fields
    cv.sections?.forEach((section, index) => {
        if (!section.id) {
            errors.push(`Section ${index} missing id`);
        }
        if (!section.type) {
            errors.push(`Section ${index} missing type`);
        }
        if (typeof section.order !== 'number') {
            errors.push(`Section ${index} missing order`);
        }
    });

    return {
        valid: errors.length === 0,
        errors,
    };
}

/**
 * Clone CV data (deep copy)
 */
export function cloneCV(cv: CVData): CVData {
    return JSON.parse(JSON.stringify(cv));
}

/**
 * Get section by ID
 */
export function getSectionById(cv: CVData, sectionId: string): CVComponent | undefined {
    return cv.sections.find(s => s.id === sectionId);
}

/**
 * Update section data
 */
export function updateSection(
    cv: CVData,
    sectionId: string,
    data: any
): CVData {
    return {
        ...cv,
        sections: cv.sections.map(section =>
            section.id === sectionId
                ? { ...section, data }
                : section
        ),
        metadata: {
            ...cv.metadata,
            updatedAt: new Date().toISOString(),
        },
    };
}

/**
 * Remove section
 */
export function removeSection(cv: CVData, sectionId: string): CVData {
    return {
        ...cv,
        sections: cv.sections
            .filter(s => s.id !== sectionId)
            .map((section, index) => ({ ...section, order: index })),
        metadata: {
            ...cv.metadata,
            updatedAt: new Date().toISOString(),
        },
    };
}

/**
 * Add section
 */
export function addSection(cv: CVData, component: CVComponent): CVData {
    return {
        ...cv,
        sections: [...cv.sections, component].sort((a, b) => a.order - b.order),
        metadata: {
            ...cv.metadata,
            updatedAt: new Date().toISOString(),
        },
    };
}
