import * as promiseUtils from "@arcgis/core/core/promiseUtils.js";
import Point from '@arcgis/core/geometry/Point';
import * as webMercatorUtils from "@arcgis/core/geometry/support/webMercatorUtils.js";
import React, { useState, useEffect, useContext } from 'react';
import { MapContext } from '../../contexts/MapProvider';

const MouseInfo: React.FC = () => {
    const [lat, setLat] = useState<string>('');
    const [long, setLong] = useState<string>('');
    const [scale, setScale] = useState<string>('');
    const { view } = useContext(MapContext)

    useEffect(() => {

        if (!view) {
            return;
        }

        console.log('initial load or view change', view);
        const debouncedUpdate = promiseUtils.debounce(async (event: __esri.ViewPointerMoveEvent | __esri.ViewClickEvent) => {
            var point = view.toMap({ x: event.x, y: event.y });
            var mp: Point = webMercatorUtils.webMercatorToGeographic(point) as Point;

            setLat(`Lat: ${mp?.y.toFixed(3)},`);
            setLong(`Lon: ${mp?.x.toFixed(3)}`);
        });

        // add the thousands separator to numbers.  ie 2,342,000
        function addCommas(x: string) {
            return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }

        const handle = view.watch('zoom', () => {
            setScale("scale: 1:" + addCommas(view.scale.toFixed(0)));
        });



        // const mobile = view.heightBreakpoint === "xsmall" && view.widthBreakpoint === "xsmall";


        console.log('heightBreakpoint', view.heightBreakpoint);
        // console.log('widthBreakpoint', view.widthBreakpoint);

        // console.log('is mobile', mobile);


        let pointerMoveHandler: __esri.Handle | undefined, clickHandler: __esri.Handle | undefined;

        // if (!mobile) {

        // view.on('pointer-move', (event: __esri.ViewPointerMoveEvent) => {
        //     console.log("this log works as expected on page load");
        // }
        // );
        pointerMoveHandler = view.on("pointer-move", (event: __esri.ViewPointerMoveEvent) => {

            // console.log("this log doesn't work on page load");

            console.log('view breakpoint', view.heightBreakpoint, view.widthBreakpoint);


            debouncedUpdate(event).catch((err: __esri.Error) => {
                if (!promiseUtils.isAbortError(err)) {
                    throw err;
                }
            });
        });
        // }

        // if (mobile) {
        //     clickHandler = view.on("click", (event: __esri.ViewClickEvent) => {
        //         debouncedUpdate(event).catch((err: __esri.Error) => {
        //             if (!promiseUtils.isAbortError(err)) {
        //                 throw err;
        //             }
        //         });
        //     });
        // }

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
    }, [view]);

    return (
        <div className='mouse-info'>
            <div className="scale">{scale}</div>
            <div className="mouseposition">{lat}&nbsp;&nbsp;{long}</div>
            <div className="mapundercusor"></div>
        </div >
    );
}

export default MouseInfo;