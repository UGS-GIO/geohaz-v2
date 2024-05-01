import { useEffect, useRef, useContext, useCallback } from 'react';
import { MapContext } from '../contexts/MapProvider';
import { addCommas } from '../config/util/utils';
import * as webMercatorUtils from "@arcgis/core/geometry/support/webMercatorUtils.js";
import Point from '@arcgis/core/geometry/Point';
import * as reactiveUtils from "@arcgis/core/core/reactiveUtils.js";
import PopupTemplate from "@arcgis/core/PopupTemplate.js";
import { UIPositionOptions } from '../config/types/mappingTypes';



interface ArcGISWidgetProps {
    WrappedWidget: any;
    position?: UIPositionOptions;
    config?: object;
}

interface FeatureHandleTypes {
    view: __esri.MapView | __esri.SceneView;
    widget: __esri.Feature;
}

interface updatePopupTemplateTypes {
    widget: __esri.Feature;
    xyPoint: { x: string, y: string };
    scale: number;
}

function useArcGISWidget(widgets: ArcGISWidgetProps[]) {
    const { view, isMobile } = useContext(MapContext);
    const widgetInstances = useRef(new Map());

    // Function to create a new widget
    const createWidget = useCallback((WrappedWidget: any, position: UIPositionOptions, config: object) => {
        const widget = new WrappedWidget({
            view,
            ...config
        });

        widgetInstances.current.set(WrappedWidget, widget);
        view?.ui.add(widget, position);

        return widget;
    }, [view]);

    // Function to update the popup template
    const updatePopupTemplate = useCallback(({ widget, xyPoint, scale }: updatePopupTemplateTypes) => {
        widget.graphic.popupTemplate = new PopupTemplate({
            title: isMobile ? '' : "<b>Coordinates</b>",
            content: `Lat: ${xyPoint.y}, Lon: ${xyPoint.x}<br>Scale: 1:${addCommas(scale.toFixed(0))}`,
        });
    }, [isMobile]);


    // Function to handle zoom events
    const handleZoom = useCallback(({ view, widget }: FeatureHandleTypes) => {
        return view.watch('zoom', () => {
            updatePopupTemplate({
                widget, xyPoint: { x: '', y: '' }, scale: view.scale
            })
        });
    }, [updatePopupTemplate]);

    // Function to handle pointer move events
    const handlePointerMove = useCallback(({ view, widget }: FeatureHandleTypes) => {
        return view.on("pointer-move", (event: __esri.ViewPointerMoveEvent) => {
            const mapPoint = view.toMap({ x: event.x, y: event.y });
            const mp: Point = webMercatorUtils.webMercatorToGeographic(mapPoint) as Point;

            const xyPoint = {
                x: mp.x.toFixed(3),
                y: mp.y.toFixed(3)
            }

            updatePopupTemplate({ widget, xyPoint: { x: xyPoint.x, y: xyPoint.y }, scale: view.scale });
        });
    }, [updatePopupTemplate]);

    useEffect(() => {
        if (view) {
            widgets.forEach(({ WrappedWidget, position = "top-left", config = {} }) => {
                const widget = createWidget(WrappedWidget, position, config);

                if (WrappedWidget.name === 'Feature') {

                    let pointerMoveHandler: __esri.Handle | undefined;

                    if (!isMobile) {
                        pointerMoveHandler = handlePointerMove({ view, widget });
                    }

                    // Watch for changes in zoom level and center of the view
                    const handle = reactiveUtils.watch(() => [view.zoom, view.center],
                        () => {
                            if (isMobile) {
                                const xyPoint = {
                                    x: view.center.longitude.toFixed(3),
                                    y: view.center.latitude.toFixed(3)
                                }

                                updatePopupTemplate({ widget, xyPoint, scale: view.scale });
                            }
                        });

                    // Clean up event listeners when the component is unmounted
                    return () => {
                        if (pointerMoveHandler) {
                            pointerMoveHandler.remove();
                        }
                        if (handle) {
                            handle.remove();
                        }
                        handle.remove();
                    };
                }
            });
        }

        // Capture the current value of widgetInstances.current in a closure
        const currentWidgetInstances = widgetInstances.current;

        return () => {
            currentWidgetInstances.forEach((widget, WrappedWidget) => {
                view?.ui.remove(widget);
                currentWidgetInstances.delete(WrappedWidget);
            });
        }
    }, [widgets, view, isMobile, createWidget, handleZoom, handlePointerMove, updatePopupTemplate]);

    return widgetInstances;
}

export default useArcGISWidget;