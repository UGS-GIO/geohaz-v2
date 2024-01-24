import { createContext, useState } from "react";
import type SceneView from "@arcgis/core/views/SceneView";
import type MapView from "@arcgis/core/views/MapView";

type MapContextProps = {
    view?: SceneView | MapView,
    loadMap?: (container: HTMLDivElement) => Promise<void>
}

export const MapContext = createContext<MapContextProps>({});

export function MapProvider({ children }: { children: React.ReactNode }) {
    const [view, setView] = useState<SceneView | MapView>()

    async function loadMap(container: HTMLDivElement) {
        if (view) return;
        const { init } = await import("../config/mapping")
        setView(init(container, 'scene'))
    }

    return (
        <MapContext.Provider value={{ view, loadMap }}>
            {children}
        </MapContext.Provider>
    )
}