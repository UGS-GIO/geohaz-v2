import { MapContext } from '@/context/map-provider'


import { useContext, useEffect, useRef } from "react";
import MapWidgets from './map-widgets';

export default function ArcGISMap() {

    const mapRef = useRef<HTMLDivElement>(null);
    const { loadMap } = useContext(MapContext)

    useEffect(() => {
        if (mapRef.current && loadMap) {
            loadMap(mapRef.current);
        }
    }, [mapRef, loadMap]);

    return (
        <div className="w-full h-full" ref={mapRef}>
            <MapWidgets />
        </div>
    );
}
