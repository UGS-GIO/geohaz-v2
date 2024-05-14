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
    const lastPointerPosition = useRef<{ x: string, y: string }>({ x: '', y: '' });

    // Function to create a new widget
    const createWidget = useCallback((WrappedWidget: any, position: UIPositionOptions, config: object) => {
        const widget = new WrappedWidget({
            view,
            ...config
        });

        const widgetId = Symbol(WrappedWidget.name);
        widgetInstances.current.set(widgetId, widget);
        view?.ui.add(widget, position);

        return { widget, widgetId };
    }, [view]);

    // Function to update the popup template
    const updatePopupTemplate = useCallback(({ widget, xyPoint, scale }: updatePopupTemplateTypes) => {
        widget.graphic.popupTemplate = new PopupTemplate({
            content: `Lat: ${xyPoint.y}, Lon: ${xyPoint.x}<br>Scale: 1:${addCommas(scale.toFixed(0))}`,
        });
    }, []);

    // Function to handle zoom and center events for mobile
    const handleMobileViewChange = useCallback(({ view, widget }: FeatureHandleTypes) => {
        reactiveUtils.watch(() => [view.zoom, view.center],
            () => {
                const xyPoint = {
                    x: view.center.longitude.toFixed(3),
                    y: view.center.latitude.toFixed(3)
                }
                updatePopupTemplate({ widget, xyPoint, scale: view.scale });
            });

        return () => {

        }

    }, [updatePopupTemplate]);

    // Function to handle zoom and pointer move events for non-mobile
    const handleDesktopViewChange = useCallback(({ view, widget }: FeatureHandleTypes) => {
        const zoomWatcher = view.watch('zoom', () => {
            updatePopupTemplate({
                widget, xyPoint: { x: lastPointerPosition.current.x, y: lastPointerPosition.current.y }, scale: view.scale
            })
        });

        const pointerMoveHandler = view.on("pointer-move", (event: __esri.ViewPointerMoveEvent) => {
            const mapPoint = view.toMap({ x: event.x, y: event.y });
            const mp: Point = webMercatorUtils.webMercatorToGeographic(mapPoint) as Point;

            const xyPoint = {
                x: mp.x.toFixed(3),
                y: mp.y.toFixed(3)
            }

            lastPointerPosition.current = xyPoint; // Store the last pointer position

            updatePopupTemplate({ widget, xyPoint: { x: xyPoint.x, y: xyPoint.y }, scale: view.scale });
        });

        return () => {
            zoomWatcher.remove();
            pointerMoveHandler.remove();
        };
    }, [updatePopupTemplate]);

    useEffect(() => {
        const widgetIds = new Set<symbol>();
        let widgetRefValue: Map<symbol, any> | null = null;
        if (view) {
            widgets.forEach(({ WrappedWidget, position = "top-left", config = {} }) => {
                const { widget, widgetId } = createWidget(WrappedWidget, position, config);
                widgetRefValue = widgetInstances.current
                widgetIds.add(widgetId);

                if (WrappedWidget.name === 'Feature') {
                    let viewChangeHandler: () => void;

                    if (isMobile) {
                        viewChangeHandler = handleMobileViewChange({ view, widget });
                    } else {
                        viewChangeHandler = handleDesktopViewChange({ view, widget });
                    }

                    return () => {
                        viewChangeHandler();
                    };
                }
            });
        }

        // Cleanup
        return () => {
            widgetIds.forEach((widgetId) => {
                const widget = widgetRefValue?.get(widgetId); // Use widgetRefValue instead of widgetInstances.current
                view?.ui.remove(widget);

                widgetRefValue?.delete(widgetId); // Use widgetRefValue instead of widgetInstances.current
            });
        }
    }, [widgets, view, isMobile, createWidget, handleMobileViewChange, handleDesktopViewChange, updatePopupTemplate]);

    return widgetInstances;
}

export default useArcGISWidget;