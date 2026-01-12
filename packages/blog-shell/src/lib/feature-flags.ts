/**
 * Feature Flags Configuration
 * 
 * Use this file to enable/disable features across the application.
 * Control these via environment variables in your .env file.
 * 
 * Example .env:
 *   NEXT_PUBLIC_FEATURE_ALGO_VERSE=false
 *   NEXT_PUBLIC_FEATURE_CV_GENERATOR=true
 *   NEXT_PUBLIC_FEATURE_KNOWLEDGE_GRAPH=true
 */

const parseBoolean = (value: string | undefined, defaultValue: boolean): boolean => {
    if (value === undefined) return defaultValue;
    return value.toLowerCase() === 'true';
};

export const featureFlags = {
    /**
     * Algo Verse - JavaScript memory visualization tool
     * Currently under development, disabled by default
     * Set NEXT_PUBLIC_FEATURE_ALGO_VERSE=true to enable
     */
    ALGO_VERSE_ENABLED: parseBoolean(process.env.NEXT_PUBLIC_FEATURE_ALGO_VERSE, false),

    /**
     * CV Generator tool
     * Set NEXT_PUBLIC_FEATURE_CV_GENERATOR=false to disable
     */
    CV_GENERATOR_ENABLED: parseBoolean(process.env.NEXT_PUBLIC_FEATURE_CV_GENERATOR, true),

    /**
     * Knowledge Graph feature
     * Set NEXT_PUBLIC_FEATURE_KNOWLEDGE_GRAPH=false to disable
     */
    KNOWLEDGE_GRAPH_ENABLED: parseBoolean(process.env.NEXT_PUBLIC_FEATURE_KNOWLEDGE_GRAPH, true),
} as const;

export type FeatureFlags = typeof featureFlags;
