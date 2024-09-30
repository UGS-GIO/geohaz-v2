import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { MapContext } from '@/context/map-provider';
import { convertDDToDMS } from '@/lib/mapping-utils';
import * as webMercatorUtils from '@arcgis/core/geometry/support/webMercatorUtils';

// Custom hook to provide the sidebar context data
export function useMapCoordinates() {

    const context = useContext(MapContext);
    const { isDecimalDegrees, setIsDecimalDegrees, view } = context;
    const [scale, setScale] = useState<number>(context.view?.scale || 0);
    const [coordinates, setCoordinates] = useState<{ x: string; y: string }>({
        x: "",
        y: "",
    });
    const lastPointerPosition = useRef<{ x: string; y: string }>({
        x: "",
        y: "",
    });
    const locationCoordinateFormat = context.isDecimalDegrees ? "Decimal Degrees" : "Degrees, Minutes, Seconds"

    // Function to convert coordinates based on the format (DD or DMS)
    const convertCoordinates = useCallback(
        (x: string, y: string) => {
            if (isDecimalDegrees) {
                return { x, y }; // Return decimal degrees
            } else {
                const dmsX = convertDDToDMS(parseFloat(x));
                const dmsY = convertDDToDMS(parseFloat(y));
                return { x: dmsX, y: dmsY }; // Return DMS format
            }
        },
        [isDecimalDegrees]
    );

    // Update the coordinates format when `isDecimalDegrees` changes
    useEffect(() => {
        const { x, y } = lastPointerPosition.current;
        const convertedCoords = convertCoordinates(x, y);
        setCoordinates(convertedCoords);
    }, [isDecimalDegrees, convertCoordinates, lastPointerPosition, setCoordinates]);


    // Update coordinates when pointer moves or zoom changes for desktop view
    const handleDesktopViewChange = useCallback(
        ({ view }: { view: __esri.MapView | __esri.SceneView }) => {
            let zoomWatcher: __esri.WatchHandle;
            let pointerMoveHandler: __esri.WatchHandle;

            view.when(() => {
                zoomWatcher = view.watch("zoom", () => {
                    const { x, y } = lastPointerPosition.current;
                    const convertedCoords = convertCoordinates(x, y);
                    setCoordinates(convertedCoords);
                    setScale(view.scale);
                });

                pointerMoveHandler = view.on(
                    "pointer-move",
                    (event: __esri.ViewPointerMoveEvent) => {
                        const mapPoint = view.toMap({ x: event.x, y: event.y });
                        const mp: __esri.Point = webMercatorUtils.webMercatorToGeographic(
                            mapPoint
                        ) as __esri.Point;

                        const xyPoint = {
                            x: mp.x.toFixed(3),
                            y: mp.y.toFixed(3),
                        };

                        lastPointerPosition.current = xyPoint; // Store the last pointer position
                        const convertedCoords = convertCoordinates(xyPoint.x, xyPoint.y);
                        setCoordinates(convertedCoords);
                        setScale(view.scale);
                    }
                );
            });

            return () => {
                if (zoomWatcher && zoomWatcher.remove) {
                    zoomWatcher.remove();
                }

                if (pointerMoveHandler && pointerMoveHandler.remove) {
                    pointerMoveHandler.remove();
                }
            };
        },
        [view, convertCoordinates]
    );

    // Ensure the hook is used within the SidebarContextProvider
    if (!context) {
        throw new Error(
            'useMapCoordinates must be used within the scope of MapContextProvider'
        );
    }

    return { isDecimalDegrees, setIsDecimalDegrees, coordinates, setCoordinates, scale, setScale, lastPointerPosition, locationCoordinateFormat, handleDesktopViewChange };
}
