import * as promiseUtils from "@arcgis/core/core/promiseUtils.js";
import Point from '@arcgis/core/geometry/Point';
import * as webMercatorUtils from "@arcgis/core/geometry/support/webMercatorUtils.js";
import React, { useState, useEffect, useContext } from 'react';
import { MapContext } from '../../contexts/MapProvider';
import * as reactiveUtils from "@arcgis/core/core/reactiveUtils.js";
import MapView from "@arcgis/core/views/MapView";
import SceneView from "@arcgis/core/views/SceneView";


const MouseInfo = ({ view }: { view: MapView | SceneView }) => {
    const [lat, setLat] = useState<string>('');
    const [long, setLong] = useState<string>('');
    const [scale, setScale] = useState<string>('');
    const [mobile, setMobile] = useState<boolean>(false);

    console.log('help', view);



    useEffect(() => {
        if (!view) {
            return;
        }

        const debouncedUpdate = promiseUtils.debounce(async (xyPoint: { x: string, y: string }) => {
            setLat(`Lat: ${xyPoint.y},`);
            setLong(`Lon: ${xyPoint.x}`);
        });

        // add the thousands separator to numbers.  ie 2,342,000
        function addCommas(x: string) {
            return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }

        const handle = view.watch('zoom', () => {
            setScale("scale: 1:" + addCommas(view.scale.toFixed(0)));
        });

        reactiveUtils.watch(() => [view.heightBreakpoint, view.widthBreakpoint],
            ([heightBreakpoint, widthBreakpoint]) => {

                if (heightBreakpoint === "xsmall" || widthBreakpoint === "xsmall") {
                    setMobile(true);
                } else {
                    setMobile(false);
                }
            });


        let pointerMoveHandler: __esri.Handle | undefined, clickHandler: __esri.Handle | undefined, dragHandler: __esri.Handle | undefined;

        if (!mobile) {
            console.log('mobile', mobile);

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

        if (mobile) {
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
    }, [view, mobile]);

    return (
        <div className='bg-gray-500 rounded-md p-2 opacity-85'>
            <div className="scale">{scale}</div>
            <div className="mouseposition">{lat}&nbsp;&nbsp;{long}</div>
            <div className="mapundercusor"></div>
        </div >
    );
}

export default MouseInfo;