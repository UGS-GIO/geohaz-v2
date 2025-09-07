import { useCallback } from 'react';
import Point from '@arcgis/core/geometry/Point';
import { clearGraphics } from '@/lib/map/highlight-utils';

interface MapClickEvent {
    screenX: number;
    screenY: number;
}

interface UseMapClickHandlerProps {
    view: __esri.MapView | __esri.SceneView | undefined;
    isSketching: boolean;
    onPointClick: (point: Point) => void;
    getVisibleLayers: (params: { view: __esri.MapView | __esri.SceneView }) => any;
    setVisibleLayersMap: (layers: any) => void;
}

/**
 * Custom hook to handle map click events.
 * Clears existing graphics, updates visible layers, converts screen coordinates to map coordinates,
 * and triggers a callback with the map point.
 * @param view - The ArcGIS MapView or SceneView instance.
 * @param isSketching - Boolean indicating if sketching mode is active.
 * @param onPointClick - Callback function to be called with the map point on click.
 * @param getVisibleLayers - Function to retrieve currently visible layers from the view.
 * @param setVisibleLayersMap - Function to update the state of visible layers.
 * @returns An object containing the handleMapClick function.
 */
export function useMapClickHandler({
    view,
    isSketching,
    onPointClick,
    getVisibleLayers,
    setVisibleLayersMap
}: UseMapClickHandlerProps) {

    const handleMapClick = useCallback((event: MapClickEvent) => {
        if (!view || isSketching) return;

        // Clear existing graphics
        clearGraphics(view);

        // Update visible layers state
        const layers = getVisibleLayers({ view });
        setVisibleLayersMap(layers.layerVisibilityMap);

        // Convert screen coordinates to map coordinates
        const mapPoint = view.toMap({
            x: event.screenX,
            y: event.screenY
        }) || new Point();

        // Trigger the callback with the map point
        onPointClick(mapPoint);
    }, [view, isSketching, onPointClick, getVisibleLayers, setVisibleLayersMap]);

    return { handleMapClick };
}