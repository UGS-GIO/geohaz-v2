import { useEffect, useRef } from 'react';
import { highlightFeature } from '@/lib/map/highlight-utils';
import { LayerContentProps } from '@/components/custom/popups/popup-content-with-pagination';

interface UseFeatureResponseHandlerProps {
    isSuccess: boolean;
    featureData: LayerContentProps[];
    view: __esri.MapView | __esri.SceneView | undefined;
    drawerTriggerRef: React.RefObject<HTMLButtonElement>;
    clickId?: number | null; // Allow null from initial state
}

/**
 * Custom hook to handle side effects based on feature query responses.
 * Highlights the first feature on the map and manages the visibility of a drawer
 * based on whether features are found.
 * @param isSuccess - Indicates if the feature query was successful.
 * @param featureData - The data returned from the feature query.
 * @param view - The ArcGIS MapView or SceneView instance.
 * @param drawerTriggerRef - Ref to the button that toggles the drawer visibility.
 * @param clickId - Unique identifier for each map click to prevent filter changes from closing drawer.
 */
export function useFeatureResponseHandler({
    isSuccess,
    featureData,
    view,
    drawerTriggerRef,
    clickId
}: UseFeatureResponseHandlerProps) {
    // Track the last click we processed to avoid re-processing on filter changes
    const lastProcessedClickRef = useRef<number | null | undefined>();

    useEffect(() => {
        // Only process if this is a NEW click (not a filter change)
        if (!isSuccess || clickId === undefined || clickId === null || lastProcessedClickRef.current === clickId) {
            return;
        }

        // Mark this click as processed
        lastProcessedClickRef.current = clickId;

        const popupContent = featureData || [];
        const hasFeatures = popupContent.length > 0;
        const firstLayer = popupContent[0];
        const firstFeature = firstLayer?.features[0];
        const drawerState = drawerTriggerRef.current?.getAttribute('data-state');

        // Handle feature highlighting
        if (hasFeatures && firstFeature && view && firstLayer) {
            const title = firstLayer.layerTitle || firstLayer.groupLayerTitle;
            highlightFeature(firstFeature, view, firstLayer.sourceCRS, title);
        }

        // Handle drawer visibility - only for NEW clicks
        if (!hasFeatures && drawerState === 'open') {
            // Close drawer if no features found on this click
            drawerTriggerRef.current?.click();
        } else if (hasFeatures && drawerState !== 'open') {
            // Open drawer if features found on this click
            drawerTriggerRef.current?.click();
        }
        // If drawer is already open and we have features, leave it open (don't re-click)
    }, [isSuccess, featureData, view, drawerTriggerRef, clickId]);
}