import { useQuery } from '@tanstack/react-query';
import { useRef } from 'react';
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
    const currentPage = useGetCurrentPage();

    const { data: isLoading = false } = useQuery({
        queryKey: ['mapLoading', `${currentPage}`],
        queryFn: () => {
            return new Promise<boolean>((resolve) => {
                if (!view) {
                    resolve(false);
                    return;
                }

                // Set up watchers only once
                if (!handlersSetRef.current) {
                    const updateLoadingState = () => {
                        const isDataLoading = view.updating && !view.navigating;

                        // Early return if we only want initial load and we've already loaded
                        if (initialLoadOnly && hasInitiallyLoadedRef.current) {
                            if (debounceTimeoutRef.current) {
                                clearTimeout(debounceTimeoutRef.current);
                                debounceTimeoutRef.current = null;
                            }
                            resolve(false);
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
                                resolve(true);
                            }, debounceMs);
                        } else {
                            // Hide loading immediately when done
                            resolve(false);
                            if (!hasInitiallyLoadedRef.current) {
                                hasInitiallyLoadedRef.current = true;
                            }
                        }
                    };

                    // Watch both updating and navigating states
                    view.watch("updating", updateLoadingState);
                    view.watch("navigating", updateLoadingState);

                    handlersSetRef.current = true;

                    // Set initial state
                    updateLoadingState();
                } else {
                    // If handlers already set, just return current state
                    const isDataLoading = view.updating && !view.navigating;
                    resolve(initialLoadOnly && hasInitiallyLoadedRef.current ? false : isDataLoading);
                }
            });
        },
        enabled: !!view,
        refetchInterval: 100, // Poll every 100ms for state changes
        staleTime: 0,
        gcTime: 0
    });

    return isLoading;
}