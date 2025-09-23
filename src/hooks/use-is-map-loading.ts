import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRef, useMemo } from 'react';
import { useGetCurrentPage } from '@/hooks/use-get-current-page';

interface UseIsMapLoadingProps {
    view?: __esri.MapView | __esri.SceneView | undefined;
    debounceMs?: number;
    initialLoadOnly?: boolean;
    watchLayerViews?: boolean; // Optional: also watch individual layer loading
}

export function useIsMapLoading({
    view,
    debounceMs = 100,
    initialLoadOnly = true,
    watchLayerViews = false
}: UseIsMapLoadingProps): boolean {
    const hasInitiallyLoadedRef = useRef(false);
    const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const handlersSetRef = useRef(false);
    const currentLoadingStateRef = useRef(false);
    const layerViewHandlesRef = useRef<__esri.Handle[]>([]);
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

        // Clean up layer view handles
        layerViewHandlesRef.current.forEach(handle => handle.remove());
        layerViewHandlesRef.current = [];

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

        const checkLayerViewsLoading = (): boolean => {
            if (!watchLayerViews) return false;

            // Check if any layer views are still updating
            const layerViews = view.layerViews.toArray();
            return layerViews.some(layerView => layerView.updating);
        };

        const updateLoadingState = () => {
            // Check multiple loading indicators for more comprehensive coverage
            const isViewUpdating = view.updating;
            const isNavigating = view.navigating;
            const isStationary = view.stationary;
            const areLayerViewsUpdating = checkLayerViewsLoading();

            // Loading check
            const isDataLoading = (isViewUpdating && !isNavigating) || !isStationary || areLayerViewsUpdating;

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

        // Set up layer view watchers if enabled
        if (watchLayerViews) {
            const setupLayerViewWatchers = () => {
                // Clean up existing layer view handles
                layerViewHandlesRef.current.forEach(handle => handle.remove());
                layerViewHandlesRef.current = [];

                // Watch each layer view's updating property
                view.layerViews.forEach(layerView => {
                    const handle = layerView.watch("updating", updateLoadingState);
                    layerViewHandlesRef.current.push(handle);
                });
            };

            // Set up initial layer view watchers
            setupLayerViewWatchers();

            // Watch for layer view additions/removals
            layerViewHandlesRef.current.push(
                view.layerViews.on("after-add", setupLayerViewWatchers),
                view.layerViews.on("after-remove", setupLayerViewWatchers)
            );
        }

        // Watch main view properties
        const handles = [
            view.watch("updating", updateLoadingState),
            view.watch("navigating", updateLoadingState),
            view.watch("stationary", updateLoadingState)
        ];

        handlersSetRef.current = true;

        // Set initial state
        updateLoadingState();

        // Return cleanup function
        return () => {
            handles.forEach(handle => handle.remove());
            layerViewHandlesRef.current.forEach(handle => handle.remove());
            layerViewHandlesRef.current = [];
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
                debounceTimeoutRef.current = null;
            }
        };
    }, [view, debounceMs, initialLoadOnly, watchLayerViews, setLoadingState]);

    // Get current loading state from query cache
    const cachedState = queryClient.getQueryData<boolean>(queryKey);
    return cachedState ?? false;
}