// const handleMobileViewChange = useCallback(
//     ({ view }: { view: __esri.MapView | __esri.SceneView }) => {
//         let watchHandle: __esri.WatchHandle;
//         view.when(() => {
//             watchHandle = reactiveUtils.watch(
//                 () => [view.zoom, view.center],
//                 () => {
//                     const xyPoint = {
//                         x: view.center.longitude.toFixed(3),
//                         y: view.center.latitude.toFixed(3),
//                     };
//                     const convertedCoords = convertCoordinates(xyPoint.x, xyPoint.y);
//                     setCoordinates(convertedCoords);
//                     setScale(view.scale);
//                 }
//             );
//         })

//         return () => {
//             watchHandle.remove();
//         };
//     },
//     [view]
// );


import { MapContext } from "@/context/map-provider";
import { useMapCoordinates } from "@/hooks/use-map-coordinates";
import { convertDDToDMS } from "@/lib/mapping-utils";
import { addCommas } from "@/lib/utils";
import * as reactiveUtils from "@arcgis/core/core/reactiveUtils.js";
import * as webMercatorUtils from "@arcgis/core/geometry/support/webMercatorUtils.js";
import { useCallback, useContext, useEffect } from "react";

const MapCoordinates = () => {
    const { view, isMobile } = useContext(MapContext);
    const {
        isDecimalDegrees,
        coordinates,
        setCoordinates,
        scale,
        setScale,
        lastPointerPosition,
    } = useMapCoordinates();

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

    // Update the coordinates format when `isDecimalDegrees` changes
    useEffect(() => {
        const { x, y } = lastPointerPosition.current;
        const convertedCoords = convertCoordinates(x, y);
        setCoordinates(convertedCoords);
    }, [isDecimalDegrees, convertCoordinates, lastPointerPosition, setCoordinates]);

    // Use desktop or mobile view handlers based on device type
    useEffect(() => {
        let viewChangeHandler: () => void;

        if (view) {

            if (isMobile) {
                // viewChangeHandler = handleMobileViewChange({ view });
            } else {
                viewChangeHandler = handleDesktopViewChange({ view });
            }
        }

        return () => {
            if (viewChangeHandler) viewChangeHandler();
        };
    }, [view, isMobile, handleDesktopViewChange]);

    return (
        <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Lat:{' '}{coordinates.y}</span>
            <span className="text-sm text-muted-foreground">Lon:{' '}{coordinates.x}</span>
            <span className="text-sm text-muted-foreground">
                Scale: 1:{addCommas(scale?.toFixed(0).toString() || '')}
            </span>
        </div>
    );
};

export { MapCoordinates };
