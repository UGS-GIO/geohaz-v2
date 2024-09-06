import { useRef, useContext, useEffect, useState } from "react";
import MapWidgets from './map-widgets';
import { MapContext } from '@/context/map-provider';
import { convertDDToDMS } from "@/lib/mapping-utils";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useCoordinateFormat } from "@/hooks/use-coordinate-format";
import PopupPortal from "@/components/custom/popup-portal";

export default function ArcGISMap() {
    const mapRef = useRef<HTMLDivElement>(null);
    const { loadMap, view, isDecimalDegrees } = useContext(MapContext);
    const [coords, setCoords] = useState({ lat: '1234', lon: '12345' });
    const popupRoot = document.createElement('div');


    useEffect(() => {
        if (mapRef.current && loadMap) {

            view?.when(() => {
                function setContentInfo(center: { lat: string, lon: string }) {
                    setCoords({
                        lat: center.lat,
                        lon: center.lon,
                    });
                    return popupRoot;
                }
            });
            loadMap(mapRef.current);
        }



    }, [mapRef, loadMap]);

    interface CoordinatePopupProps {
        coords: { lat: string, lon: string };
    }



    const CoordinatePopup = ({ coords }: CoordinatePopupProps) => {
        const { isDecimalDegrees, setIsDecimalDegrees } = useCoordinateFormat();
        const { lat, lon } = coords
        console.log('isDecimalDegrees in the coordinate popupsickly', coords);


        // const handleCoordinateFormatChange = (value: string) => {
        //     console.log('handleCoordinateFormatChange in the coordinate popup', value === 'decimal');

        //     setIsDecimalDegrees(value === 'decimal');
        // }

        // Display coordinates based on the selected format
        const displayLat = isDecimalDegrees ? lat : convertDDToDMS(parseFloat(lat));
        const displayLon = isDecimalDegrees ? lon : convertDDToDMS(parseFloat(lon));

        return (
            <>
                <div>
                    Lat: {displayLat}<br />
                    Lon: {displayLon}
                </div>
                {/* <RadioGroup defaultValue="decimal" onValueChange={(value) => handleCoordinateFormatChange(value)}>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="decimal" id="decimal" />
                        <Label htmlFor="decimal">Decimal Degrees</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="dms" id="dms" />
                        <Label htmlFor="dms">Degrees, Minutes, Seconds</Label>
                    </div>
                </RadioGroup> */}
            </>
        );
    };


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
                // const popupContainer = document.createElement('div');

                // Use React 18's createRoot API
                // const root = createRoot(popupContainer);
                // root.render(<CoordinatePopup lat={lat} lon={lon} />);

                view.popup.dockEnabled = false;
                view.openPopup({
                    title: 'Coordinates',
                    content: setContentInfo({ lat: lat, lon: lon }),
                    location: mapPoint
                });
            } else { // Left-click
                view.popup.dockEnabled = true;
            }
        }
    };

    return (
        <>
            <div className="relative w-full h-full" ref={mapRef} onContextMenu={handleOnContextMenu}>
                <PopupPortal mount={popupRoot}>
                    <CoordinatePopup coords={coords} />
                </PopupPortal>
                <MapWidgets />
            </div>
        </>
    );
}
