import { useEffect, useState, useRef } from 'react';

interface UseIsMapLoadingProps {
    view?: __esri.MapView | __esri.SceneView | undefined;
    debounceMs?: number; // Default to 500ms
    initialLoadOnly?: boolean; // Only show during initial load
}

export function useIsMapLoading({
    view,
    debounceMs = 500,
    initialLoadOnly = true
}: UseIsMapLoadingProps): boolean {
    const [isLoading, setIsLoading] = useState(false);
    const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false);
    const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const loadingStateRef = useRef(false);

    useEffect(() => {
        if (!view) {
            setIsLoading(false);
            return;
        }

        const handles: __esri.Handle[] = [];

        const updateLoadingState = () => {
            const isDataLoading = view.updating && !view.navigating;

            console.log('Updating loading state:', {
                updating: view.updating,
                navigating: view.navigating,
                isDataLoading,
                hasInitiallyLoaded,
                initialLoadOnly
            });

            // If we only want initial load and we've already loaded, don't update loading state
            if (initialLoadOnly && hasInitiallyLoaded) {
                setIsLoading(false);
                return;
            }

            loadingStateRef.current = isDataLoading;

            // Clear existing timeout
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
                debounceTimeoutRef.current = null;
            }

            if (isDataLoading) {
                // Show loading after debounce delay
                debounceTimeoutRef.current = setTimeout(() => {
                    if (loadingStateRef.current) { // Check if still loading
                        setIsLoading(true);
                    }
                }, debounceMs);
            } else {
                // Hide loading immediately when done
                setIsLoading(false);
                if (!hasInitiallyLoaded) {
                    setHasInitiallyLoaded(true);
                }
            }
        };

        // Watch both updating and navigating states
        handles.push(
            view.watch("updating", updateLoadingState),
            view.watch("navigating", updateLoadingState)
        );

        // Set initial state
        updateLoadingState();

        return () => {
            handles.forEach(handle => handle.remove());
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }
        };
    }, [view, debounceMs, initialLoadOnly, hasInitiallyLoaded]);

    return isLoading;
}