import { useState, useRef, useEffect } from 'react';

interface UseIsMapLoadingProps {
    view?: __esri.MapView | __esri.SceneView | undefined;
    debounceMs?: number;
}

export function useIsMapLoading({
    view,
    debounceMs = 200
}: UseIsMapLoadingProps): boolean {
    const [isLoading, setIsLoading] = useState(true);

    // Track if we've completed the initial load
    const hasInitiallyLoadedRef = useRef(false);
    const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const handlesRef = useRef<__esri.Handle[]>([]);

    useEffect(() => {
        // Cleanup previous effects
        handlesRef.current.forEach(handle => handle.remove());
        handlesRef.current = [];
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }

        if (!view) {
            setIsLoading(false);
            return;
        }

        // If we've already completed initial load for any view, don't show loading
        if (hasInitiallyLoadedRef.current) {
            setIsLoading(false);
            return;
        }

        const updateLoadingStatus = () => {
            // If we've already completed initial load, ignore further updates
            if (hasInitiallyLoadedRef.current) {
                return;
            }

            const isCurrentlyLoading = view.updating || !view.stationary || !view.ready;

            // Clear any pending timeout
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
                debounceTimeoutRef.current = null;
            }

            if (isCurrentlyLoading) {
                // Map is loading - set immediately
                setIsLoading(true);
            } else {
                // Map appears to be done loading - debounce before marking as complete
                debounceTimeoutRef.current = setTimeout(() => {
                    if (!hasInitiallyLoadedRef.current) {
                        setIsLoading(false);
                        hasInitiallyLoadedRef.current = true;

                        // Clean up watchers after initial load
                        handlesRef.current.forEach(handle => handle.remove());
                        handlesRef.current = [];
                    }
                }, debounceMs);
            }
        };

        // Set up watchers to detect loading state
        handlesRef.current = [
            view.watch("ready", updateLoadingStatus),
            view.watch("updating", updateLoadingStatus),
            view.watch("stationary", updateLoadingStatus)
        ];

        // Check initial state
        updateLoadingStatus();

        // Cleanup function
        return () => {
            handlesRef.current.forEach(handle => handle.remove());
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }
        };
    }, [view, debounceMs]);

    return isLoading;
}