import { useRef, useContext, useEffect, useCallback } from "react";
import MapWidgets from './map-widgets';
import { MapContext } from '@/context/map-provider';
import { MapContextMenu } from "./map-context-menu";
import { createGraphic, removeGraphics } from "@/lib/mapping-utils";
import { useMapCoordinates } from "@/hooks/use-map-coordinates";

export default function ArcGISMap() {
    const mapRef = useRef<HTMLDivElement>(null);
    const hiddenTriggerRef = useRef<HTMLDivElement>(null);
    const { loadMap, view } = useContext(MapContext);
    const { coordinates, setCoordinates } = useMapCoordinates();

    // Handle right-click event to show the context menu
    const handleOnContextMenu = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (view) {

            const x = e.nativeEvent.offsetX;
            const y = e.nativeEvent.offsetY;
            // Convert offsetX and offsetX to map coordinates
            const mapPoint = view.toMap({ x: x, y: y });

            // Update selected coordinates with the converted lat/lon
            const latitude = mapPoint.latitude;
            const longitude = mapPoint.longitude;

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
    }, [view, setCoordinates]);

    useEffect(() => {
        if (mapRef.current && loadMap) {
            loadMap(mapRef.current);
        }
    }, [mapRef, loadMap]);

    return (
        <>
            <MapContextMenu hiddenTriggerRef={hiddenTriggerRef} coordinates={coordinates} />
            <div
                className="relative w-full h-full"
                ref={mapRef}
                onContextMenu={handleOnContextMenu}  // Trigger context menu on right-click
            >
                <MapWidgets />
            </div>
        </>
    );
}
