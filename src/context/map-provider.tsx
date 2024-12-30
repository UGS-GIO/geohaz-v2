import { createContext, useEffect, useState } from "react";
import type SceneView from "@arcgis/core/views/SceneView";
import type MapView from "@arcgis/core/views/MapView";
import * as reactiveUtils from "@arcgis/core/core/reactiveUtils.js";
import { LayerProps } from "@/lib/types/mapping-types";

type MapContextProps = {
    view?: SceneView | MapView,
    activeLayers?: __esri.Collection<__esri.Layer>, // add a layers property to the context
    loadMap?: (container: HTMLDivElement, { zoom, center }: { zoom: number, center: [number, number] }, layers: LayerProps[]) => Promise<void>
    setActiveLayers?: (layers: __esri.Collection<__esri.Layer>) => void
    isMobile?: boolean
    setIsMobile?: (isMobile: boolean) => void
    layerDescriptions?: Record<string, string>
    isDecimalDegrees: boolean
    setIsDecimalDegrees: (isDecimalDegrees: boolean) => void
    coordinates: { x: string; y: string }
    setCoordinates: (coords: { x: string; y: string }) => void
    isSketching?: boolean
    setIsSketching?: (isSketching: boolean) => void
}

// type FeatureAttributes = {
//     title: string;
//     content: string;
// };

// type Feature = {
//     attributes: FeatureAttributes;
// };

// type LayerDescriptionResponse = {
//     features: Feature[];
// };

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

    async function loadMap(container: HTMLDivElement, { zoom, center }: { zoom: number, center: [number, number] }, layers: LayerProps[]) {
        if (view) return;
        const { init } = await import("@/lib/mapping-utils")
        setView(init(container, isMobile, { zoom, center }, layers, 'map'));
    }



    return (
        <MapContext.Provider value={{ view, loadMap, activeLayers, setActiveLayers, isMobile, setIsMobile, isDecimalDegrees, setIsDecimalDegrees, coordinates, setCoordinates, isSketching, setIsSketching }}>
            {children}
        </MapContext.Provider>
    )
}