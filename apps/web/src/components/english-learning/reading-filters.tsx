'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const TOPICS = ['Technology', 'Science', 'Culture', 'History', 'Nature', 'Health'];

export function ReadingFilters() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const createQueryString = useCallback(
        (name: string, value: string) => {
            const params = new URLSearchParams(searchParams.toString());
            if (value) {
                params.set(name, value);
            } else {
                params.delete(name);
            }
            return params.toString();
        },
        [searchParams]
    );

    const handleLevelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        router.push(`?${createQueryString('level', e.target.value)}`);
    };

    const handleTopicChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        router.push(`?${createQueryString('topic', e.target.value)}`);
    };

    return (
        <div className="flex flex-col sm:flex-row gap-4 mb-8 justify-center">
            <select
                className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={searchParams.get('level') || ''}
                onChange={handleLevelChange}
            >
                <option value="">All Levels</option>
                {LEVELS.map(level => (
                    <option key={level} value={level}>{level}</option>
                ))}
            </select>

            <select
                className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={searchParams.get('topic') || ''}
                onChange={handleTopicChange}
            >
                <option value="">All Topics</option>
                {TOPICS.map(topic => (
                    <option key={topic} value={topic}>{topic}</option>
                ))}
            </select>
        </div>
    );
}
