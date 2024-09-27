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
        setIsDecimalDegrees,
        coordinates,
        setCoordinates,
        scale,
        setScale,
        lastPointerPosition
    } = useMapCoordinates();



    const convertCoordinates = useCallback(
        (x: string, y: string) => {
            console.log('convertCoordinates', isDecimalDegrees);

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

    // Function to handle zoom and pointer move events for non-mobile
    const handleDesktopViewChange = useCallback(
        ({ view }: { view: __esri.MapView | __esri.SceneView }) => {
            let zoomWatcher: __esri.WatchHandle;
            let pointerMoveHandler: __esri.WatchHandle;
            view.when(() => {
                zoomWatcher = view.watch("zoom", () => {

                    if (isDecimalDegrees) {
                        setCoordinates({
                            x: lastPointerPosition.current.x,
                            y: lastPointerPosition.current.y,
                        });
                    }

                    setScale(view.scale);
                    setCoordinates({
                        x: lastPointerPosition.current.x,
                        y: lastPointerPosition.current.y,
                    });
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

                        const convertedCoords = convertCoordinates(xyPoint.x, xyPoint.y);
                        lastPointerPosition.current = convertedCoords;

                        lastPointerPosition.current = xyPoint; // Store the last pointer position
                        setCoordinates(convertedCoords);
                        setScale(view.scale);
                    }
                );
            });

            return () => {
                zoomWatcher.remove();
                pointerMoveHandler.remove();
            };
        },
        [view]
    );

    useEffect(() => {
        if (view) {
            // Use the type guard to check if the widget is a Feature widget
            let viewChangeHandler: () => void;

            if (isMobile) {
                // viewChangeHandler = handleMobileViewChange({ view });
            } else {
                viewChangeHandler = handleDesktopViewChange({ view });
            }

            return () => {
                viewChangeHandler();
            };
        }

    }, [
        view,
        isMobile,
        // handleMobileViewChange,
        handleDesktopViewChange,
        convertCoordinates
    ]);


    return (
        <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">{coordinates.x}</span>
            <span className="text-sm text-muted-foreground">{coordinates.y}</span>
            <span className="text-sm text-muted-foreground">Scale: 1:{addCommas(scale?.toFixed(0).toString() || '')}</span>
        </div>
    )
}

export { MapCoordinates }