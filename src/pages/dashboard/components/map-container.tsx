import { useRef, useContext, useEffect, useState, useCallback } from "react";
import MapWidgets from './map-widgets';
import { MapContext } from '@/context/map-provider';
import { MapContextMenu } from "./map-context-menu";

export default function ArcGISMap() {
    const mapRef = useRef<HTMLDivElement>(null);
    const hiddenTriggerRef = useRef<HTMLDivElement>(null);
    const { loadMap, view } = useContext(MapContext);
    const [selectedCoordinates, setSelectedCoordinates] = useState({ x: 0, y: 0 });

    // Handle right-click event to show the context menu
    const handleOnContextMenu = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault();

        console.log('handleOnContextMenu', e);

        const mapPoint = view?.toMap({ x: e.clientX, y: e.clientY });
        if (mapPoint) {
            setSelectedCoordinates({ x: mapPoint.latitude, y: mapPoint.longitude });
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

    useEffect(() => {
        if (mapRef.current && loadMap) {
            loadMap(mapRef.current);
        }
    }, [mapRef, loadMap]);

    return (
        <>
            <MapContextMenu hiddenTriggerRef={hiddenTriggerRef} selectedCoordinates={selectedCoordinates} />
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
