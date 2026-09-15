import { useState, useEffect } from "react";

export function useMediaQuery(query: string): boolean | null {
    // Return null on server/initial render to indicate "not yet determined"
    const [matches, setMatches] = useState<boolean | null>(null);

    useEffect(() => {
        // Only run on client
        if (typeof window === 'undefined') return;

        const media = window.matchMedia(query);
        // Immediately set the correct value on mount
        setMatches(media.matches);

        const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
        media.addEventListener("change", listener);
        return () => media.removeEventListener("change", listener);
    }, [query]);

    return matches;
}
