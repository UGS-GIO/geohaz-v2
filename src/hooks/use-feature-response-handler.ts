import { useEffect } from 'react';
import { highlightFeature } from '@/lib/map/highlight-utils';
import { LayerContentProps } from '@/components/custom/popups/popup-content-with-pagination';

interface UseFeatureResponseHandlerProps {
    isSuccess: boolean;
    featureData: LayerContentProps[];
    view: __esri.MapView | __esri.SceneView | undefined;
    drawerTriggerRef: React.RefObject<HTMLButtonElement>;
}

/**
 * Custom hook to handle side effects based on feature query responses.
 * Highlights the first feature on the map and manages the visibility of a drawer
 * based on whether features are found.
 * @param isSuccess - Indicates if the feature query was successful.
 * @param featureData - The data returned from the feature query.
 * @param view - The ArcGIS MapView or SceneView instance.
 * @param drawerTriggerRef - Ref to the button that toggles the drawer visibility.
 */
export function useFeatureResponseHandler({
    isSuccess,
    featureData,
    view,
    drawerTriggerRef
}: UseFeatureResponseHandlerProps) {

    useEffect(() => {
        if (!isSuccess) return;

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

        // Handle drawer visibility
        if (!hasFeatures && drawerState === 'open') {
            drawerTriggerRef.current?.click();
        } else if (hasFeatures && drawerState !== 'open') {
            drawerTriggerRef.current?.click();
        }
    }, [isSuccess, featureData, view, drawerTriggerRef]);
}