import { createContext, useState, useCallback, useRef, ReactNode } from "react";
import type SceneView from "@arcgis/core/views/SceneView";
import type MapView from "@arcgis/core/views/MapView";
import { LayerProps } from "@/lib/types/mapping-types";
import { init } from "@/lib/map/utils";
import { useIsMobile } from "@/hooks/use-mobile";

type MapContextProps = {
    view?: SceneView | MapView;
    map?: __esri.Map;
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
    }) => Promise<void>;
    isSketching: boolean;
    setIsSketching?: (isSketching: boolean) => void;
}

export const MapContext = createContext<MapContextProps>({
    view: undefined,
    map: undefined,
    loadMap: async () => { },
    isSketching: false,
    setIsSketching: () => { }
});

export function MapProvider({ children }: { children: ReactNode }) {
    const viewRef = useRef<SceneView | MapView>();
    const mapRef = useRef<__esri.Map>();
    const [isInitialized, setIsInitialized] = useState(false);
    const [isSketching, setIsSketching] = useState<boolean>(false);
    const isMobile = useIsMobile();

    const loadMap = useCallback(async ({
        container,
        zoom = 10,
        center = [0, 0],
        layers = []
    }: {
        container: HTMLDivElement,
        zoom?: number,
        center?: [number, number],
        layers?: LayerProps[]
    }) => {
        // Case 1: The map and view already exist, so we only sync layer visibility.
        if (viewRef.current && mapRef.current) {
            const map = mapRef.current;
            const visibilityMap = new Map();

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

            // Iterate through the LIVE layers on the map and update their visibility
            map.allLayers.forEach(liveLayer => {
                const shouldBeVisible = visibilityMap.get(liveLayer.title);
                if (shouldBeVisible !== undefined && liveLayer.visible !== shouldBeVisible) {
                    liveLayer.visible = shouldBeVisible;
                }
            });
        }
        // Case 2: The map has not been created yet.
        else {
            const { view: initView, map: initMap } = await init(container, isMobile, { zoom, center }, layers, 'map');
            await initView.when();

            viewRef.current = initView;
            mapRef.current = initMap;
            setIsInitialized(true);
        }
    }, [isMobile]);

    return (
        <MapContext.Provider value={{
            view: viewRef.current,
            map: mapRef.current,
            loadMap,
            isSketching,
            setIsSketching
        }}>
            {children}
        </MapContext.Provider>
    );
}