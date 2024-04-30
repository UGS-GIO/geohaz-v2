import * as promiseUtils from "@arcgis/core/core/promiseUtils.js";
import Point from '@arcgis/core/geometry/Point';
import * as webMercatorUtils from "@arcgis/core/geometry/support/webMercatorUtils.js";
import { useState, useEffect, useContext } from 'react';
import * as reactiveUtils from "@arcgis/core/core/reactiveUtils.js";
import MapView from "@arcgis/core/views/MapView";
import SceneView from "@arcgis/core/views/SceneView";
import { MapContext } from "../../contexts/MapProvider";

// add the thousands separator to numbers.  ie 2,342,000
function addCommas(x: string) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}


const MouseInfo = ({ view }: { view: MapView | SceneView }) => {
    // set initial states for lat, long, and scale
    const [lat, setLat] = useState<string>(view.center.latitude.toFixed(3).toString());
    const [long, setLong] = useState<string>(view.center.longitude.toFixed(3).toString());
    const [scale, setScale] = useState<string>('');
    const { isMobile } = useContext(MapContext);

    useEffect(() => {
        if (!view) {
            return;
        }

        const debouncedUpdate = promiseUtils.debounce(async (xyPoint: { x: string, y: string }) => {
            setLat(`Lat: ${xyPoint.y},`);
            setLong(`Lon: ${xyPoint.x}`);
        });


        const handle = view.watch('zoom', () => {
            setScale("scale: 1:" + addCommas(view.scale.toFixed(0)));
        });

        let pointerMoveHandler: __esri.Handle | undefined, clickHandler: __esri.Handle | undefined;

        if (!isMobile) {
            // watch for pointer move events and update the lat/long display
            pointerMoveHandler = view.on("pointer-move", (event: __esri.ViewPointerMoveEvent) => {

                const mapPoint = view.toMap({ x: event.x, y: event.y });
                const mp: Point = webMercatorUtils.webMercatorToGeographic(mapPoint) as Point;

                const xyPoint = {
                    x: mp.x.toFixed(3),
                    y: mp.y.toFixed(3)
                }

                debouncedUpdate(xyPoint).catch((err: __esri.Error) => {
                    if (!promiseUtils.isAbortError(err)) {
                        throw err;
                    }
                });
            });
        }

        if (isMobile) {
            reactiveUtils.watch(
                // getValue function
                () => view.stationary,
                // callback
                () => {
                    const { longitude, latitude } = view.center;
                    const centerXY = {
                        x: longitude.toFixed(3),
                        y: latitude.toFixed(3)
                    }
                    debouncedUpdate(centerXY).catch((err: __esri.Error) => {
                        if (!promiseUtils.isAbortError(err)) {
                            throw err;
                        }
                    });
                });
        }

        // Clean up event listeners when the component is unmounted
        return () => {
            if (pointerMoveHandler) {
                pointerMoveHandler.remove();
            }
            if (clickHandler) {
                clickHandler.remove();
            }
            handle.remove();
        };
    }, [view, isMobile]);

    return (
        <div>
            <div className="scale">{scale}</div>
            <div className="mouseposition">{lat}&nbsp;&nbsp;{long}</div>
            <div className="mapundercusor"></div>
        </div >
    );
}

export default MouseInfo;