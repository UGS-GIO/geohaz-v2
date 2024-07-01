import * as reactiveUtils from "@arcgis/core/core/reactiveUtils";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import GroupLayer from "@arcgis/core/layers/GroupLayer";
import MapImageLayer from "@arcgis/core/layers/MapImageLayer";
import TileLayer from "@arcgis/core/layers/TileLayer";
import Map from '@arcgis/core/Map'
import MapView from "@arcgis/core/views/MapView";
import SceneView from "@arcgis/core/views/SceneView";
import { LayerProps, layerTypeMapping } from "../types/mappingTypes";
import * as promiseUtils from "@arcgis/core/core/promiseUtils.js";
import Color from "@arcgis/core/Color";
import BasemapGallery from "@arcgis/core/widgets/BasemapGallery";
import Expand from "@arcgis/core/widgets/Expand";
import Popup from "@arcgis/core/widgets/Popup";
import GeoJSONLayer from "@arcgis/core/layers/GeoJSONLayer";
import WFSLayer from "@arcgis/core/layers/WFSLayer";

// Create a new map
export const createMap = () => {
    const map = new Map({
        basemap: 'topo-vector',
    });
    return map;
}

// Create a new view
export const createView = (container: HTMLDivElement, map: Map, viewType: 'map' | 'scene' = 'scene', isMobile: boolean) => {

    // Common options for both MapView and SceneView
    const commonOptions = {
        container: container,
        map: map,
        zoom: 8,
        center: [-112, 39.5],
        highlightOptions: {
            color: new Color([255, 255, 0, 1]),
            haloColor: new Color("white"),
            haloOpacity: 0.9,
            fillOpacity: 0.2
        },
        ui: {
            components: ['zoom', 'compass', 'attribution',]
        },
        ...(!isMobile && {
            popup: new Popup({
                dockEnabled: true,
                dockOptions: {
                    // Disables the dock button from the popup
                    buttonEnabled: false,
                    // Ignore the default sizes that trigger responsive docking
                    breakpoint: false,
                    position: 'bottom-left',
                }
            })
        }),
    }

    return viewType === 'scene'
        ? new SceneView({ ...commonOptions })
        : new MapView({ ...commonOptions });
}

// Dynamically add layers to the map
export const addLayersToMap = (map: Map, layers: LayerProps[]) => {
    // Add layers to the map
    layers.forEach((layer: LayerProps) => {
        const createdLayer = createLayer(layer)
        if (createdLayer) {
            map.add(createdLayer)
        }
    })
}

// Helper function to reduce code duplication in createLayer
function createLayerFromUrl(layer: LayerProps, LayerType: any) {
    console.log('layer', layer);
    console.log('LayerType', LayerType);

    // Create a layer based on the layer props
    if ('url' in layer) {
        console.log('options', layer);

        return new LayerType({
            url: layer.url,
            activeLayer: layer.activeLayer || undefined,
            // ...layer.options,
        });
    }

    if (layer.type === 'group') {
        if (layer.layers) {
            // Create an array of group layers by mapping the layers and filtering out any undefined elements
            const groupedLayers = layer.layers.map(createLayer).filter(layer => layer !== undefined) as (FeatureLayer | TileLayer | GroupLayer | MapImageLayer | GeoJSONLayer)[];
            return groupedLayers;
        }
    }

    console.warn(`Missing URL in layer props: ${JSON.stringify(layer)}`);
    return undefined;

}

// Create a layer based on the layer props
export const createLayer = (layer: LayerProps): FeatureLayer | TileLayer | GroupLayer | MapImageLayer | GeoJSONLayer | WFSLayer | undefined => {
    // Handle the special case for group layers
    if (layer.type === 'group' && layer.layers) {
        const groupLayers = layer.layers.map(createLayer).filter(layer => layer !== undefined) as (FeatureLayer | TileLayer | GroupLayer | MapImageLayer | GeoJSONLayer)[];
        return new GroupLayer({
            title: layer.title,
            visible: layer.visible,
            layers: groupLayers,
        });
    }

    // Get the LayerType from the mapping
    const LayerType = layerTypeMapping[layer.type];

    // If the LayerType exists, create a new layer
    if (LayerType) {
        return createLayerFromUrl(layer, LayerType);
    }

    console.warn(`Unsupported layer type: ${layer.type}`);
    return undefined;
}

// Set the popup alignment based on the location of the popup
export function setPopupAlignment(view: SceneView | MapView) {
    reactiveUtils.watch(() => view.popup?.id, function () {
        view.popup.alignment = function () {
            const { location, view } = this;

            if ((location) && (view)) {
                const viewPoint = view.toScreen(location);
                const y2 = view.height / 2;
                const x2 = view.width / 3;
                const x3 = x2 * 2;

                if (viewPoint.y >= y2) {
                    if (viewPoint.x < x2)
                        return "top-right";
                    else if (viewPoint.x > x3)
                        return "top-left";
                } else {
                    if (viewPoint.x < x2)
                        return "bottom-right";
                    else if (viewPoint.x > x3)
                        return "bottom-left";
                    else
                        return "bottom-center";
                }
            }

            return "top-center";
        };
    });
}

export function expandClickHandlers(view: SceneView | MapView) {
    view.when().then(() => {
        const bgExpand = view.ui.find("basemap-gallery-expand") as Expand | undefined;

        if (bgExpand) {
            bgExpand.when().then(() => {
                const basemapGallery = bgExpand?.content as BasemapGallery;
                // Watch for changes on the active basemap and collapse the expand widget if the view is mobile size
                reactiveUtils.watch(
                    () => basemapGallery.activeBasemap,
                    () => {
                        const mobileSize = view.heightBreakpoint === "xsmall" || view.widthBreakpoint === "xsmall";
                        if (mobileSize) {
                            bgExpand.collapse();
                        }
                    }
                );
            });
        }

        // Debounce the update to prevent the expand widget from opening and closing rapidly
        const debouncedUpdate = promiseUtils.debounce(async () => {
            if (bgExpand) {
                const typedExpand = bgExpand as Expand;
                typedExpand.collapse();
            }
        });

        const handleEvent = () => {
            debouncedUpdate().catch((err) => {
                if (!promiseUtils.isAbortError(err)) {
                    console.error(err);
                }
            });
        };

        view.on("click", handleEvent);
        view.on("double-click", handleEvent);
        view.on("drag", handleEvent);
    });
}