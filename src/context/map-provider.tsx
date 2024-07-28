import { createContext, useEffect, useState } from "react";
import type SceneView from "@arcgis/core/views/SceneView";
import type MapView from "@arcgis/core/views/MapView";
import LayerList from "@arcgis/core/widgets/LayerList";
import * as reactiveUtils from "@arcgis/core/core/reactiveUtils.js";
import { useQuery } from "@tanstack/react-query";
import { getRenderers } from "@/lib/mapping-utils";
import { RendererProps } from "@/lib/types/mapping-types";


type MapContextProps = {
    view?: SceneView | MapView,
    activeLayers?: __esri.Collection<__esri.ListItem>, // add a layers property to the context
    loadMap?: (container: HTMLDivElement) => Promise<void>
    setActiveLayers?: (layers: __esri.Collection<__esri.ListItem>) => void
    getRenderer?: (id: string, url: string) => Promise<RendererProps | undefined>
    isMobile?: boolean
    setIsMobile?: (isMobile: boolean) => void
    layerDescriptions?: Record<string, string>

}

type FeatureAttributes = {
    title: string;
    content: string;
};

type Feature = {
    attributes: FeatureAttributes;
};

type LayerDescriptionResponse = {
    features: Feature[];
};

export const MapContext = createContext<MapContextProps>({});

export function MapProvider({ children }: { children: React.ReactNode }) {
    const [view, setView] = useState<SceneView | MapView>();
    const [activeLayers, setActiveLayers] = useState<__esri.Collection<__esri.ListItem>>();
    const [isMobile, setIsMobile] = useState<boolean>(false);
    const [layerDescriptions, setLayerDescriptions] = useState<Record<string, string>>({});

    // const fetchLayerDescriptions = async (): Promise<LayerDescriptionResponse> => {
    //     const response = await fetch(`https://services.arcgis.com/ZzrwjTRez6FJiOq4/arcgis/rest/services/Hazard_Layer_Info_t1/FeatureServer/0/query?where=1%3D1&objectIds=&time=&resultType=none&outFields=*&returnIdsOnly=false&returnUniqueIdsOnly=false&returnCountOnly=false&returnDistinctValues=false&cacheHint=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&having=&resultOffset=&resultRecordCount=&sqlFormat=none&f=pjson&token=`);
    //     const data: LayerDescriptionResponse = await response.json();
    //     const descriptions: Record<string, string> = {};
    //     data.features.forEach(feature => {
    //         descriptions[feature.attributes.title] = feature.attributes.content;
    //     });
    //     setLayerDescriptions(descriptions);
    //     return { features: data.features };
    // }

    // // fetch and return the layer descriptions only on the initial render using useQuery
    // const { data } = useQuery({
    //     queryKey: ['layerDescriptions'],
    //     queryFn: fetchLayerDescriptions,
    // });

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

        // Clean up - destroy the LayerList widget when component unmounts
        return () => {
            layerList.destroy();
        };

    }, [view]);

    async function loadMap(container: HTMLDivElement) {
        if (view) return;
        const { init } = await import("@/lib/mapping-utils")
        setView(init(container, isMobile, 'map'))
    }

    async function getRenderer(id: string, url: string): Promise<RendererProps | undefined> {
        if (!view || !view.map) return;
        const { renderers, mapImageRenderers } = await getRenderers(view, view.map as __esri.Map);
        const RegularLayerRenderer = renderers.filter(renderer => renderer.id === id);
        const MapImageLayerRenderer = mapImageRenderers.filter(renderer => renderer.url === url);

        return {
            MapImageLayerRenderer,
            RegularLayerRenderer,
        };
    };

    return (
        <MapContext.Provider value={{ view, loadMap, activeLayers, setActiveLayers, getRenderer, isMobile, setIsMobile, layerDescriptions }}>
            {children}
        </MapContext.Provider>
    )
}