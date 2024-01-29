import { createContext, useEffect, useState } from "react";
import type SceneView from "@arcgis/core/views/SceneView";
import type MapView from "@arcgis/core/views/MapView";
import LayerList from "@arcgis/core/widgets/LayerList";


type MapContextProps = {
    view?: SceneView | MapView,
    activeLayers?: __esri.Collection<__esri.ListItem>, // add a layers property to the context
    loadMap?: (container: HTMLDivElement) => Promise<void>
    setActiveLayers?: (layers: __esri.Collection<__esri.ListItem>) => void
}

export const MapContext = createContext<MapContextProps>({});

export function MapProvider({ children }: { children: React.ReactNode }) {
    const [view, setView] = useState<SceneView | MapView>();
    const [activeLayers, setActiveLayers] = useState<__esri.Collection<__esri.ListItem>>();

    useEffect(() => {
        if (!view) return;

        // Create LayerList widget
        const layerList = new LayerList({
            view: view,
        });

        // Get LayerList view model
        const layerListViewModel = layerList.viewModel;

        // Access operational items
        const operationalItems = layerListViewModel.operationalItems;

        // Update the active layers in the context
        setActiveLayers(operationalItems);

        // Clean up - destroy the LayerList widget when component unmounts
        return () => {
            layerList.destroy();
        };
    }, [view]);

    async function loadMap(container: HTMLDivElement) {
        if (view) return;
        const { init } = await import("../config/mapping")
        setView(init(container, 'scene'))
    }



    return (
        <MapContext.Provider value={{ view, loadMap, activeLayers, setActiveLayers }}>
            {children}
        </MapContext.Provider>
    )
}