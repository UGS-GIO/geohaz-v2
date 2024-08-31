import { createContext, useEffect, useState } from "react";
import type SceneView from "@arcgis/core/views/SceneView";
import type MapView from "@arcgis/core/views/MapView";
import LayerList from "@arcgis/core/widgets/LayerList";
import * as reactiveUtils from "@arcgis/core/core/reactiveUtils.js";
// import { useQuery } from "@tanstack/react-query";
import { RendererProps } from "@/lib/types/mapping-types";
import { useFetchLayerDescriptions } from "@/hooks/use-fetch-layer-descriptions";


type MapContextProps = {
    view?: SceneView | MapView,
    activeLayers?: __esri.Collection<__esri.ListItem>, // add a layers property to the context
    loadMap?: (container: HTMLDivElement) => Promise<void>
    setActiveLayers?: (layers: __esri.Collection<__esri.ListItem>) => void
    getRenderer?: (id: string, url: string) => Promise<RendererProps | undefined>
    isMobile?: boolean
    setIsMobile?: (isMobile: boolean) => void
    layerDescriptions: Record<string, string>
    isDecimalDegrees?: boolean
    setIsDecimalDegrees?: (isDecimalDegrees: boolean) => void
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
    view: undefined,
    activeLayers: undefined,
    loadMap: async () => { },
    setActiveLayers: () => { },
    getRenderer: async () => { return undefined },
    isMobile: false,
    setIsMobile: () => { },
    layerDescriptions: {},
    isDecimalDegrees: false,
    setIsDecimalDegrees: () => { },
});

const fetchLayerDescriptions = async (setLayerDescriptions: (descriptions: Record<string, string>) => void) => {
    const descriptions = await useFetchLayerDescriptions();
    setLayerDescriptions(descriptions);
}

export function MapProvider({ children }: { children: React.ReactNode }) {
    const [view, setView] = useState<SceneView | MapView>();
    const [activeLayers, setActiveLayers] = useState<__esri.Collection<__esri.ListItem>>();
    const [isMobile, setIsMobile] = useState<boolean>(false);
    const [isDecimalDegrees, setIsDecimalDegrees] = useState<boolean>(false);
    const [layerDescriptions, setLayerDescriptions] = useState<Record<string, string>>({});

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
        fetchLayerDescriptions(setLayerDescriptions);

        // Clean up - destroy the LayerList widget when component unmounts
        return () => {
            layerList.destroy();
        };

    }, [view]);

    useEffect(() => {
        console.log(layerDescriptions);
    }, [layerDescriptions]);
    async function loadMap(container: HTMLDivElement) {
        if (view) return;
        const { init } = await import("@/lib/mapping-utils")
        setView(init(container, isMobile, 'map'))
    }



    return (
        <MapContext.Provider value={{ view, loadMap, activeLayers, setActiveLayers, isMobile, setIsMobile, layerDescriptions, isDecimalDegrees, setIsDecimalDegrees }}>
            {children}
        </MapContext.Provider>
    )
}