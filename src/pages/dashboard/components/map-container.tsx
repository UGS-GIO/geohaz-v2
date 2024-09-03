import { useRef, useContext, useEffect } from "react";
import MapWidgets from './map-widgets';
import { MapContext } from '@/context/map-provider';
import { convertDDToDMS } from "@/lib/mapping-utils";

export default function ArcGISMap() {
    const mapRef = useRef<HTMLDivElement>(null);
    const { loadMap, view, isDecimalDegrees } = useContext(MapContext);

    useEffect(() => {
        if (mapRef.current && loadMap) {
            loadMap(mapRef.current);
        }
    }, [mapRef, loadMap]);

    const handleOnContextMenu = (event: React.MouseEvent<HTMLDivElement>) => {
        // Get the bounding rectangle of the map container
        const mapContainerRect = view?.container.getBoundingClientRect();

        // Adjust the event coordinates by subtracting the offsets of the map container
        const adjustedX = event.clientX - (mapContainerRect?.left ?? 0);
        const adjustedY = event.clientY - (mapContainerRect?.top ?? 0);

        // Convert the adjusted screen coordinates to map coordinates
        const mapPoint = view?.toMap({ x: adjustedX, y: adjustedY });

        let lat: string, lon: string;

        if (!isDecimalDegrees) {
            lat = convertDDToDMS(mapPoint?.latitude ?? 0);
            lon = convertDDToDMS(mapPoint?.longitude ?? 0);
        } else {
            lat = mapPoint?.latitude.toFixed(4) ?? '';
            lon = mapPoint?.longitude.toFixed(4) ?? '';
        }

        if (view) {
            if (event.type === 'contextmenu') { // Right-click or long press
                view.popup.dockEnabled = false;
                view.popup.open({
                    title: 'Coordinates',
                    content: `Lat: ${lat}, Lng: ${lon}`,
                    location: mapPoint,
                });
            } else { // Left-click
                view.popup.dockEnabled = true;
            }
        }
    };

    return (
        <>
            <div className="relative w-full h-full" ref={mapRef} onContextMenu={handleOnContextMenu}>
                <MapWidgets />
            </div>
        </>
    );
}
