import type { CVData, StoredCV } from '@/lib/cv/types';
import { validateCV } from '@/lib/cv/utils';

/**
 * localStorage wrapper for CV data persistence
 */

const STORAGE_KEY = 'cv-generator-data';
const MAX_CVS = 10; // Limit to prevent quota issues

export class CVStorage {
    /**
     * Save CV to localStorage
     */
    save(cv: CVData): void {
        try {
            // Validate before saving
            const validation = validateCV(cv);
            if (!validation.valid) {
                console.error('Invalid CV data:', validation.errors);
                throw new Error('Cannot save invalid CV data');
            }

            const cvs = this.getAll();
            const index = cvs.findIndex(c => c.metadata.id === cv.metadata.id);

            if (index >= 0) {
                // Update existing
                cvs[index] = cv;
            } else {
                // Add new
                cvs.push(cv);

                // Remove oldest if exceeds limit
                if (cvs.length > MAX_CVS) {
                    cvs.sort((a, b) =>
                        new Date(a.metadata.updatedAt).getTime() -
                        new Date(b.metadata.updatedAt).getTime()
                    );
                    cvs.shift();
                }
            }

            localStorage.setItem(STORAGE_KEY, JSON.stringify(cvs));
        } catch (error) {
            console.error('Failed to save CV:', error);
            throw error;
        }
    }

    /**
     * Get all saved CVs
     */
    getAll(): CVData[] {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Failed to load CVs:', error);
            return [];
        }
    }

    /**
     * Get CV by ID
     */
    getById(id: string): CVData | null {
        const cvs = this.getAll();
        return cvs.find(c => c.metadata.id === id) || null;
    }

    /**
     * Delete CV by ID
     */
    delete(id: string): void {
        try {
            const cvs = this.getAll().filter(c => c.metadata.id !== id);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(cvs));
        } catch (error) {
            console.error('Failed to delete CV:', error);
            throw error;
        }
    }

    /**
     * Get list of saved CVs (metadata only)
     */
    getList(): StoredCV[] {
        const cvs = this.getAll();
        return cvs.map(cv => ({
            id: cv.metadata.id,
            name: cv.metadata.name || this.extractName(cv),
            updatedAt: cv.metadata.updatedAt,
        }));
    }

    /**
     * Export CV as JSON file
     */
    exportJSON(id: string): void {
        const cv = this.getById(id);
        if (!cv) {
            throw new Error('CV not found');
        }

        const blob = new Blob([JSON.stringify(cv, null, 2)], {
            type: 'application/json',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.extractName(cv)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    /**
     * Import CV from JSON file
     */
    async importJSON(file: File): Promise<CVData> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const cv = JSON.parse(e.target?.result as string) as CVData;

                    // Validate imported data
                    const validation = validateCV(cv);
                    if (!validation.valid) {
                        reject(new Error(`Invalid CV data: ${validation.errors.join(', ')}`));
                        return;
                    }

                    // Update timestamps
                    cv.metadata.updatedAt = new Date().toISOString();

                    this.save(cv);
                    resolve(cv);
                } catch (error) {
                    reject(new Error('Failed to parse JSON file'));
                }
            };

            reader.onerror = () => {
                reject(new Error('Failed to read file'));
            };

            reader.readAsText(file);
        });
    }

    /**
     * Clear all saved CVs
     */
    clear(): void {
        localStorage.removeItem(STORAGE_KEY);
    }

    /**
     * Get storage usage info
     */
    getStorageInfo(): { used: number; total: number; percentage: number } {
        const data = localStorage.getItem(STORAGE_KEY) || '';
        const used = new Blob([data]).size;
        const total = 5 * 1024 * 1024; // 5MB typical localStorage limit

        return {
            used,
            total,
            percentage: (used / total) * 100,
        };
    }

    /**
     * Extract name from CV (fallback to header name) - public version
     */
    extractCVName(cv: CVData): string {
        return this.extractName(cv);
    }

    /**
     * Extract name from CV (fallback to header name)
     */
    private extractName(cv: CVData): string {
        if (cv.metadata.name) {
            return cv.metadata.name;
        }

        const headerSection = cv.sections.find(s => s.type === 'header');
        if (headerSection?.data?.name) {
            return `${headerSection.data.name}_CV`;
        }

        return `CV_${cv.metadata.id.substring(0, 8)}`;
    }
}

// Export singleton instance
export const cvStorage = new CVStorage();
