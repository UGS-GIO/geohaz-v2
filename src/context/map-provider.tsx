import { createContext, useEffect, useState } from "react";
import type SceneView from "@arcgis/core/views/SceneView";
import type MapView from "@arcgis/core/views/MapView";
import * as reactiveUtils from "@arcgis/core/core/reactiveUtils.js";
import { LayerProps } from "@/lib/types/mapping-types";
import { init } from "@/lib/mapping-utils";

type ViewType = 'map' | 'scene';

type MapContextProps = {
    view?: SceneView | MapView,
    activeLayers?: __esri.Collection<__esri.Layer>,
    loadMap?: (container: HTMLDivElement, { zoom, center }: { zoom: number, center: [number, number] }, layers: LayerProps[], viewType: ViewType) => Promise<void>,
    setActiveLayers?: (layers: __esri.Collection<__esri.Layer>) => void,
    isMobile?: boolean,
    setIsMobile?: (isMobile: boolean) => void,
    layerDescriptions?: Record<string, string>,
    isDecimalDegrees: boolean,
    setIsDecimalDegrees: (isDecimalDegrees: boolean) => void,
    coordinates: { x: string; y: string },
    setCoordinates: (coords: { x: string; y: string }) => void,
    isSketching?: boolean,
    setIsSketching?: (isSketching: boolean) => void
}

export const MapContext = createContext<MapContextProps>({
    coordinates: { x: "000.000", y: "000.000" },
    setCoordinates: () => { },
    view: undefined,
    activeLayers: undefined,
    loadMap: async () => { },
    setActiveLayers: () => { },
    isMobile: false,
    setIsMobile: () => { },
    layerDescriptions: {},
    isDecimalDegrees: false,
    setIsDecimalDegrees: () => { },
});

export function MapProvider({ children }: { children: React.ReactNode }) {
    const [view, setView] = useState<SceneView | MapView>();
    const [activeLayers, setActiveLayers] = useState<__esri.Collection<__esri.Layer>>();
    const [coordinates, setCoordinates] = useState<{ x: string; y: string }>({ x: "000.000", y: "000.000" });
    const [isMobile, setIsMobile] = useState<boolean>(false);
    const [isDecimalDegrees, setIsDecimalDegrees] = useState<boolean>(true);
    const [isSketching, setIsSketching] = useState<boolean>(false);

    useEffect(() => {
        if (!view) return;
        // Update the active layers in the context
        setActiveLayers(view.map.layers);

        // Determine if the view is mobile
        reactiveUtils.watch(() => [view.heightBreakpoint, view.widthBreakpoint],
            ([heightBreakpoint, widthBreakpoint]) => {

                if (heightBreakpoint === "xsmall" || widthBreakpoint === "xsmall") {
                    setIsMobile(true);
                } else {
                    setIsMobile(false);
                }
            }
        );

        setIsMobile(view.widthBreakpoint === "xsmall" || view.heightBreakpoint === "xsmall");
    }, [view]);


    async function loadMap(container: HTMLDivElement, { zoom, center }: { zoom: number, center: [number, number] }, layers: LayerProps[], viewType: ViewType) {
        if (view) return;

        // Initialize the map with the appropriate view type
        setView(init(container, isMobile, { zoom, center }, layers, viewType)); // default to map view, todo: add scene view capability
    }

    return (
        <MapContext.Provider value={{ view, loadMap, activeLayers, setActiveLayers, isMobile, setIsMobile, isDecimalDegrees, setIsDecimalDegrees, coordinates, setCoordinates, isSketching, setIsSketching }}>
            {children}
        </MapContext.Provider>
    )
}