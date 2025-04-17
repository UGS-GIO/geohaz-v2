/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useRef, useContext, useCallback } from "react";
import * as webMercatorUtils from "@arcgis/core/geometry/support/webMercatorUtils.js";
import * as reactiveUtils from "@arcgis/core/core/reactiveUtils.js";
import { MapContext } from "@/context/map-provider";
import { UIPositionOptions } from "@/lib/types/mapping-types";
import Point from "@arcgis/core/geometry/Point";

// Define a type for the widget constructors
type WidgetConstructor<T extends __esri.Widget> = new (args: any) => T;

interface ArcGISWidgetProps {
    WrappedWidget: WidgetConstructor<__esri.Widget>;
    position?: UIPositionOptions;
    config?: object; // Use `unknown` instead of `any`
}

interface FeatureHandleTypes {
    view: __esri.MapView | __esri.SceneView;
    widget: __esri.Feature;
}

// Type guard to check if a widget is a Feature widget
function isFeatureWidget(widget: __esri.Widget): widget is __esri.Feature {
    return (widget as __esri.Feature).graphic !== undefined;
}

function useArcGISWidget(widgets: ArcGISWidgetProps[]) {
    const { view, isMobile } = useContext(MapContext);
    const widgetInstances = useRef<Map<symbol, __esri.Widget>>(new Map());
    const lastPointerPosition = useRef<{ x: string; y: string }>({
        x: "",
        y: "",
    });

    // Function to create a new widget
    const createWidget = useCallback(
        (
            WrappedWidget: WidgetConstructor<__esri.Widget>,
            position: UIPositionOptions,
            config: object = {}
        ) => {

            const widget = new WrappedWidget({
                view,
                ...config,
            });

            const widgetId = Symbol(WrappedWidget.name);
            widgetInstances.current.set(widgetId, widget);
            view?.ui.add(widget, position);

            return { widget, widgetId };
        },
        [view]
    );

    // Function to handle zoom and center events for mobile
    const handleMobileViewChange = useCallback(
        ({ view }: FeatureHandleTypes) => {
            const watchHandle = reactiveUtils.watch(
                () => [view.zoom, view.center],
                () => {
                    // idk what to do here yet
                }
            );

            return () => {
                watchHandle.remove();
            };
        },
        []
    );

    // Function to handle zoom and pointer move events for non-mobile
    const handleDesktopViewChange = useCallback(
        ({ view }: FeatureHandleTypes) => {
            const pointerMoveHandler = view.on(
                "pointer-move",
                (event: __esri.ViewPointerMoveEvent) => {
                    const mapPoint = view.toMap({ x: event.x, y: event.y }) || new Point();
                    const mp: __esri.Point = webMercatorUtils.webMercatorToGeographic(
                        mapPoint
                    ) as __esri.Point;

                    const xyPoint = {
                        x: mp.x.toFixed(3),
                        y: mp.y.toFixed(3),
                    };

                    lastPointerPosition.current = xyPoint; // Store the last pointer position
                }
            );

            return () => {
                pointerMoveHandler.remove();
            };
        },
        []
    );

    useEffect(() => {
        const widgetIds = new Set<symbol>();
        let widgetRefValue: Map<symbol, __esri.Widget> | null = null;
        if (view) {
            widgets.forEach(
                ({ WrappedWidget, position = "top-left", config = {} }) => {
                    const { widget, widgetId } = createWidget(
                        WrappedWidget,
                        position,
                        config
                    );
                    widgetRefValue = widgetInstances.current;
                    widgetIds.add(widgetId);

                    // Use the type guard to check if the widget is a Feature widget
                    if (isFeatureWidget(widget)) {
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
                }
            );
        }

        // Cleanup
        return () => {
            widgetIds.forEach((widgetId) => {
                const widget = widgetRefValue?.get(widgetId); // Use widgetRefValue instead of widgetInstances.current

                if (widget) {
                    view?.ui.remove(widget);
                }

                widgetRefValue?.delete(widgetId); // Use widgetRefValue instead of widgetInstances.current
            });
        };
    }, [
        widgets,
        view,
        isMobile,
        createWidget,
        handleMobileViewChange,
        handleDesktopViewChange,
        // updatePopupTemplate,
    ]);

    return widgetInstances;
}

export default useArcGISWidget;
