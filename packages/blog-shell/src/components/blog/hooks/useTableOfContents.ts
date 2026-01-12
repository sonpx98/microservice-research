'use client';

import { useEffect, useState, useCallback } from 'react';

export interface TocItem {
    id: string;
    text: string;
    level: number;
}

export function useTableOfContents(contentSelector: string = '.prose') {
    const [headings, setHeadings] = useState<TocItem[]>([]);
    const [activeId, setActiveId] = useState<string>('');

    // Function to extract headings
    const extractHeadings = useCallback(() => {
        const content = document.querySelector(contentSelector);
        if (!content) return;

        const elements = content.querySelectorAll('h2, h3, h4, p > b, p > strong');
        const items: TocItem[] = [];
        const seenIds = new Set<string>();

        elements.forEach((element) => {
            let level = 3;
            const tagName = element.tagName.toLowerCase();

            if (tagName === 'b' || tagName === 'strong') {
                const parentText = element.parentElement?.textContent?.trim() || '';
                const ownText = element.textContent?.trim() || '';
                if (parentText.length > ownText.length + 5) return;
                level = 3;
            } else {
                level = parseInt(tagName.charAt(1));
            }

            let id = element.id;
            if (!id) {
                const text = element.textContent || '';
                const slug = text
                    .toLowerCase()
                    .trim()
                    .replace(/[^\w\s-]/g, '')
                    .replace(/[\s_-]+/g, '-')
                    .replace(/^-+|-+$/g, '');
                id = slug || `heading-${Math.random().toString(36).substr(2, 9)}`;
            }

            let uniqueId = id;
            let counter = 1;
            while (seenIds.has(uniqueId)) {
                uniqueId = `${id}-${counter}`;
                counter++;
            }
            seenIds.add(uniqueId);

            if (element.id !== uniqueId) {
                element.id = uniqueId;
            }

            items.push({ id: uniqueId, text: element.textContent || '', level });
        });

        setHeadings(prev => {
            if (prev.length !== items.length) return items;
            const changed = items.some((item, i) => prev[i]?.id !== item.id);
            return changed ? items : prev;
        });
    }, [contentSelector]);

    // DOM mutation observer
    useEffect(() => {
        extractHeadings();

        const content = document.querySelector(contentSelector);
        if (!content) return;

        const observer = new MutationObserver(() => extractHeadings());
        observer.observe(content, { childList: true, subtree: true });

        const timeout = setTimeout(extractHeadings, 1000);
        const timeout2 = setTimeout(extractHeadings, 3000);

        return () => {
            observer.disconnect();
            clearTimeout(timeout);
            clearTimeout(timeout2);
        };
    }, [contentSelector, extractHeadings]);

    // Intersection observer for active heading
    useEffect(() => {
        if (headings.length === 0) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.id);
                    }
                });
            },
            { rootMargin: '-80px 0px -80% 0px', threshold: 0 }
        );

        headings.forEach((heading) => {
            const element = document.getElementById(heading.id);
            if (element) observer.observe(element);
        });

        return () => observer.disconnect();
    }, [headings]);

    const scrollToHeading = useCallback((id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, []);

    return { headings, activeId, scrollToHeading };
}
