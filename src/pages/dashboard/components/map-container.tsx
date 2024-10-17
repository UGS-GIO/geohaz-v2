import { useRef, useContext, useEffect, useCallback } from "react";
import MapWidgets from "./map-widgets";
import { MapContext } from "@/context/map-provider";
import { MapContextMenu } from "./map-context-menu";
import { createGraphic, removeGraphics } from "@/lib/mapping-utils";
import { useMapCoordinates } from "@/hooks/use-map-coordinates";
import useMapUrlParams from "@/hooks/use-map-url-params";

export default function ArcGISMap() {
    const mapRef = useRef<HTMLDivElement>(null);
    const hiddenTriggerRef = useRef<HTMLDivElement>(null);
    const { loadMap, view } = useContext(MapContext);
    const { coordinates, setCoordinates } = useMapCoordinates();

    // Get zoom and center from URL params
    const { zoom, center } = useMapUrlParams(view);

    // Initialize the map with URL parameters
    useEffect(() => {
        if (mapRef.current && loadMap) {
            // Check if zoom and center are valid before loading
            if (zoom && center) {
                loadMap(mapRef.current, { zoom, center });
            }
        }
    }, [loadMap, mapRef, zoom, center]); // Add zoom and center as dependencies

    // Handle right-click event to show the context menu
    const handleOnContextMenu = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            e.preventDefault();
            if (view) {
                const mapPoint = view.toMap({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY });

                setCoordinates({
                    x: mapPoint.longitude.toString(),
                    y: mapPoint.latitude.toString(),
                });

                removeGraphics(view);
                createGraphic(mapPoint.latitude, mapPoint.longitude, view);
            }

            if (hiddenTriggerRef.current) {
                const contextMenuEvent = new MouseEvent("contextmenu", {
                    bubbles: true,
                    clientX: e.clientX,
                    clientY: e.clientY,
                });
                hiddenTriggerRef.current.dispatchEvent(contextMenuEvent);
            }
        },
        [view, setCoordinates]
    );

    return (
        <>
            <MapContextMenu hiddenTriggerRef={hiddenTriggerRef} coordinates={coordinates} />
            <div
                className="relative w-full h-full"
                ref={mapRef}
                onContextMenu={handleOnContextMenu}
            >
                <MapWidgets />
            </div>
        </>
    );
}
