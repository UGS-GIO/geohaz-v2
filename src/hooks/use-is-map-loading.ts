import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRef, useEffect } from 'react';
import { useGetCurrentPage } from '@/hooks/use-get-current-page';

interface UseIsMapLoadingProps {
    view?: __esri.MapView | __esri.SceneView | undefined;
    debounceMs?: number;
    initialLoadOnly?: boolean;
    watchLayerViews?: boolean;
}

export function useIsMapLoading({
    view,
    debounceMs = 200, // Increased default for a smoother experience
    initialLoadOnly = true,
    watchLayerViews = false
}: UseIsMapLoadingProps): boolean {
    const queryClient = useQueryClient();
    const currentPage = useGetCurrentPage();
    const queryKey = ['mapLoading', currentPage];

    // Refs to manage state and side effects without causing re-renders
    const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const hasInitiallyLoadedRef = useRef(false);
    const handlesRef = useRef<__esri.Handle[]>([]);

    const { mutate: setLoadingState } = useMutation({
        mutationFn: async (isLoading: boolean) => isLoading,
        onSuccess: (isLoading) => {
            queryClient.setQueryData(queryKey, isLoading);
        }
    });

    // Effect to watch the view and update loading state
    useEffect(() => {
        // --- Cleanup previous effects ---
        handlesRef.current.forEach(handle => handle.remove());
        handlesRef.current = [];
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }

        if (!view) {
            setLoadingState(false);
            return;
        }

        // Reset initial load flag when view changes
        hasInitiallyLoadedRef.current = false;

        const updateLoadingStatus = () => {
            // If we only care about the initial load and it's already done, stop watching.
            if (initialLoadOnly && hasInitiallyLoadedRef.current) {
                // Detach all event listeners to prevent further updates
                handlesRef.current.forEach(handle => handle.remove());
                handlesRef.current = [];
                return;
            }

            const isAnyLayerViewUpdating = watchLayerViews
                ? view.layerViews.some(lv => lv.updating)
                : false;

            const isCurrentlyLoading = view.updating || !view.stationary || isAnyLayerViewUpdating;

            // Clear any pending timeout to turn loading OFF
            clearTimeout(debounceTimeoutRef.current!);

            if (isCurrentlyLoading) {
                // If we are loading, set the state to true immediately.
                // We only want to debounce the "off" state.
                const currentState = queryClient.getQueryData(queryKey);
                if (currentState !== true) {
                    setLoadingState(true);
                }
            } else {
                // If we are NOT loading, wait debounceMs before setting state to false.
                // This prevents the loading indicator from flickering off during brief pauses.
                debounceTimeoutRef.current = setTimeout(() => {
                    setLoadingState(false);
                    if (initialLoadOnly && !hasInitiallyLoadedRef.current) {
                        hasInitiallyLoadedRef.current = true;
                        // Now that the first load is officially over, we can detach the listeners.
                        handlesRef.current.forEach(handle => handle.remove());
                        handlesRef.current = [];
                    }
                }, debounceMs);
            }
        };

        // --- Set up watchers ---
        const mainHandles = [
            view.watch("updating", updateLoadingStatus),
            view.watch("stationary", updateLoadingStatus)
        ];

        if (watchLayerViews) {
            // This function (re)builds watchers for all current layer views
            const setupLayerViewWatchers = () => {
                // First, remove any handles that are specifically for layer views
                handlesRef.current = handlesRef.current.filter(h => {
                    // A bit of a hack to identify layer view handles vs main handles
                    if ((h as any)._layerViewHandle) {
                        h.remove();
                        return false;
                    }
                    return true;
                });

                view.layerViews.forEach(layerView => {
                    const handle = layerView.watch("updating", updateLoadingStatus);
                    (handle as any)._layerViewHandle = true; // Mark it for easy removal
                    handlesRef.current.push(handle);
                });
            };

            setupLayerViewWatchers();
            mainHandles.push(view.layerViews.on("after-add", setupLayerViewWatchers));
            mainHandles.push(view.layerViews.on("after-remove", setupLayerViewWatchers));
        }

        handlesRef.current = mainHandles;

        // Check initial state
        updateLoadingStatus();

        // --- Final cleanup function ---
        return () => {
            handlesRef.current.forEach(handle => handle.remove());
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }
        };
    }, [view, debounceMs, initialLoadOnly, watchLayerViews, setLoadingState, queryClient, queryKey]);

    const cachedState = queryClient.getQueryData<boolean>(queryKey);
    return cachedState ?? true; // Default to true on first render until the effect runs
}