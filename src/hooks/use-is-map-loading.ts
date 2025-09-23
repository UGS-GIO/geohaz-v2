import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRef, useMemo } from 'react';
import { useGetCurrentPage } from '@/hooks/use-get-current-page';

interface UseIsMapLoadingProps {
    view?: __esri.MapView | __esri.SceneView | undefined;
    debounceMs?: number;
    initialLoadOnly?: boolean;
}

export function useIsMapLoading({
    view,
    debounceMs = 500,
    initialLoadOnly = true
}: UseIsMapLoadingProps): boolean {
    const hasInitiallyLoadedRef = useRef(false);
    const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const handlersSetRef = useRef(false);
    const currentLoadingStateRef = useRef(false);
    const currentPage = useGetCurrentPage();
    const queryClient = useQueryClient();

    const queryKey = ['mapLoading', `${currentPage}`];

    // Use mutation to update the loading state reactively
    const { mutate: setLoadingState } = useMutation({
        mutationFn: (isLoading: boolean) => Promise.resolve(isLoading),
        onSuccess: (isLoading) => {
            // Update the query cache with the new loading state
            queryClient.setQueryData(queryKey, isLoading);
            currentLoadingStateRef.current = isLoading;
        }
    });

    // Set up watchers only once when view changes
    useMemo(() => {
        // Clean up previous watchers
        if (handlersSetRef.current) {
            handlersSetRef.current = false;
        }

        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
            debounceTimeoutRef.current = null;
        }

        if (!view) {
            setLoadingState(false);
            return;
        }

        // Reset state for new view
        hasInitiallyLoadedRef.current = false;

        const updateLoadingState = () => {
            const isDataLoading = view.updating && !view.navigating;

            // Early return if we only want initial load and we've already loaded
            if (initialLoadOnly && hasInitiallyLoadedRef.current) {
                if (debounceTimeoutRef.current) {
                    clearTimeout(debounceTimeoutRef.current);
                    debounceTimeoutRef.current = null;
                }
                if (currentLoadingStateRef.current !== false) {
                    setLoadingState(false);
                }
                return;
            }

            // Clear existing timeout
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
                debounceTimeoutRef.current = null;
            }

            if (isDataLoading) {
                // Show loading after debounce delay
                debounceTimeoutRef.current = setTimeout(() => {
                    if (currentLoadingStateRef.current !== true) {
                        setLoadingState(true);
                    }
                }, debounceMs);
            } else {
                // Hide loading immediately when done
                if (currentLoadingStateRef.current !== false) {
                    setLoadingState(false);
                }
                if (!hasInitiallyLoadedRef.current) {
                    hasInitiallyLoadedRef.current = true;
                }
            }
        };

        // Watch both updating and navigating states
        const handles = [
            view.watch("updating", updateLoadingState),
            view.watch("navigating", updateLoadingState)
        ];

        handlersSetRef.current = true;

        // Set initial state
        updateLoadingState();

        // Return cleanup function
        return () => {
            handles.forEach(handle => handle.remove());
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
                debounceTimeoutRef.current = null;
            }
        };
    }, [view, debounceMs, initialLoadOnly, setLoadingState]);

    // Get current loading state from query cache
    const cachedState = queryClient.getQueryData<boolean>(queryKey);
    return cachedState ?? false;
}