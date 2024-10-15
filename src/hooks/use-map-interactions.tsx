import { useCallback, useState, useContext } from "react";
import { removeGraphics, createGraphic } from "@/lib/mapping-utils";
import Collection from "@arcgis/core/core/Collection.js";
import { MapContext } from "@/context/map-provider";

export const useMapInteractions = () => {
    const [visibleLayers, setVisibleLayers] = useState<__esri.Collection<__esri.Layer>>(new Collection());
    const { view } = useContext(MapContext);

    interface HandleMapClickProps {
        view?: __esri.MapView | __esri.SceneView,
    }
    // Handle map click to get visible layers
    const getVisibleLayers = ({ view }: HandleMapClickProps): __esri.Collection<__esri.Layer> => {
        if (!view) return new Collection();
        const visibleLayers = view.map.layers.filter(layer => {
            return layer.type !== 'group' && layer.visible;
        });
        setVisibleLayers(visibleLayers);
        return visibleLayers;
    };


    // Handle right-click to show context menu and update coordinates
    const handleOnContextMenu = useCallback((e: React.MouseEvent<HTMLDivElement>, hiddenTriggerRef: React.RefObject<HTMLDivElement>, setCoordinates: (coordinates: { x: string; y: string }) => void) => {
        e.preventDefault();
        if (view) {
            // offsetX and offsetY are relative to the target element (i.e. the map canvas)
            const { offsetX: x, offsetY: y } = e.nativeEvent;

            // Convert offsetX and offsetX to map coordinates
            const mapPoint = view.toMap({ x: x, y: y });

            // Update selected coordinates with the converted lat/lon
            const { latitude, longitude } = mapPoint;

            // Update your state or context with the new coordinates
            setCoordinates({ x: longitude.toString(), y: latitude.toString() }); // Assuming x = longitude and y = latitude
            removeGraphics(view);
            createGraphic(latitude, longitude, view);
        }

        if (hiddenTriggerRef.current) {
            const contextMenuEvent = new MouseEvent('contextmenu', {
                bubbles: true,
                clientX: e.clientX,
                clientY: e.clientY,
            });
            hiddenTriggerRef.current.dispatchEvent(contextMenuEvent);
        }
    }, [view]);

    return { handleOnContextMenu, visibleLayers, getVisibleLayers };
};
