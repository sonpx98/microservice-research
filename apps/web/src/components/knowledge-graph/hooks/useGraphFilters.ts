'use client';

import { useState, useMemo } from 'react';
import { Node } from 'reactflow';

export interface UseGraphFiltersReturn {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    typeFilter: string;
    setTypeFilter: (type: string) => void;
    availableTypes: string[];
    filteredNodes: Node[];
    displayNodes: Node[];
    isSearchExpanded: boolean;
    setIsSearchExpanded: (value: boolean) => void;
    isFilterOpen: boolean;
    setIsFilterOpen: (value: boolean) => void;
}

export function useGraphFilters(flowNodes: Node[]): UseGraphFiltersReturn {
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [isSearchExpanded, setIsSearchExpanded] = useState(true);
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // Get unique types for filter dropdown
    const availableTypes = useMemo(() => {
        const types = new Set<string>();
        flowNodes.forEach(node => {
            if (node.data.type) types.add(node.data.type);
        });
        return ['all', ...Array.from(types)];
    }, [flowNodes]);

    // Filter nodes based on search and type
    const filteredNodes = useMemo(() => {
        return flowNodes.filter(node => {
            const matchesSearch = searchQuery === '' ||
                node.data.label.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesType = typeFilter === 'all' || node.data.type === typeFilter;
            return matchesSearch && matchesType;
        });
    }, [flowNodes, searchQuery, typeFilter]);

    // Update node styles based on filter
    const displayNodes = useMemo(() => {
        return flowNodes.map(node => ({
            ...node,
            style: {
                ...node.style,
                opacity: filteredNodes.some(n => n.id === node.id) ? 1 : 0.2,
            }
        }));
    }, [flowNodes, filteredNodes]);

    return {
        searchQuery,
        setSearchQuery,
        typeFilter,
        setTypeFilter,
        availableTypes,
        filteredNodes,
        displayNodes,
        isSearchExpanded,
        setIsSearchExpanded,
        isFilterOpen,
        setIsFilterOpen,
    };
}
