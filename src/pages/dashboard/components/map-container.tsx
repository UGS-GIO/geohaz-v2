import { MapContext } from '@/context/map-provider'


import { useContext, useEffect, useRef, useState } from "react";
import MapWidgets from './map-widgets';
import { PopupDrawer } from '@/components/custom/popup-drawer';

export default function ArcGISMap() {
    const [popupContainer, setPopupContainer] = useState<HTMLDivElement | null>(null)

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
            <PopupDrawer container={popupContainer} />
            {/* This div serves as the custom container for the PopupDrawer component.
                By setting its ref, it means the PopupDrawer is appended to this container
                instead of the body element. 
                https://github.com/emilkowalski/vaul?tab=readme-ov-file#custom-container */}
            <div ref={setPopupContainer} />
        </div>
    );
}
