import { createContext, useEffect, useState } from "react";
import type SceneView from "@arcgis/core/views/SceneView";
import type MapView from "@arcgis/core/views/MapView";
import * as reactiveUtils from "@arcgis/core/core/reactiveUtils.js";
import { LayerProps } from "@/lib/types/mapping-types";
import { init } from "@/lib/map/utils";

type MapContextProps = {
    view?: SceneView | MapView,
    map?: __esri.Map,
    activeLayers?: __esri.Collection<__esri.Layer>, // add a layers property to the context
    loadMap?: ({
        container,
        zoom,
        center,
        layers
    }: {
        container: HTMLDivElement,
        zoom?: number,
        center?: [number, number],
        layers?: LayerProps[]
    }) => Promise<void>,
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

export const MapContext = createContext<MapContextProps>({
    coordinates: { x: "000.000", y: "000.000" },
    setCoordinates: () => { },
    view: undefined,
    map: undefined,
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
    const [map, setMap] = useState<__esri.Map>();
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

    async function loadMap({
        container,
        zoom = 10,
        center = [0, 0],
        layers = []
    }: {
        container: HTMLDivElement,
        zoom?: number,
        center?: [number, number],
        layers?: LayerProps[]
    }) {
        // If the view already exists, we just sync visibility without rebuilding the map.
        if (view) {
            // Create a simple lookup map of what *should* be visible from the URL state
            const visibilityMap = new Map();

            // Helper to recursively get all titles and their visibility
            const populateVisibilityMap = (layerConfigs: LayerProps[]) => {
                layerConfigs.forEach(config => {
                    if (config.title) {
                        visibilityMap.set(config.title, config.visible);
                    }
                    if (config.type === 'group' && 'layers' in config) {
                        populateVisibilityMap(config.layers || []);
                    }
                });
            };
            populateVisibilityMap(layers);

            // Iterate through the LIVE layers on the map and update them
            view.map.allLayers.forEach(liveLayer => {
                const shouldBeVisible = visibilityMap.get(liveLayer.title);
                if (shouldBeVisible !== undefined && liveLayer.visible !== shouldBeVisible) {
                    liveLayer.visible = shouldBeVisible;
                }
            });
        }

        // If the view does NOT exist, run the initial creation logic.
        else {
            const { view: initView, map } = init(container, isMobile, { zoom, center }, layers, 'map');
            setView(initView);
            setMap(map);
        }
    }



    return (
        <MapContext.Provider value={{ view, map, loadMap, activeLayers, setActiveLayers, isMobile, setIsMobile, isDecimalDegrees, setIsDecimalDegrees, coordinates, setCoordinates, isSketching, setIsSketching }}>
            {children}
        </MapContext.Provider>
    )
}