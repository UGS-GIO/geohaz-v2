import * as reactiveUtils from "@arcgis/core/core/reactiveUtils";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import GroupLayer from "@arcgis/core/layers/GroupLayer";
import MapImageLayer from "@arcgis/core/layers/MapImageLayer";
import TileLayer from "@arcgis/core/layers/TileLayer";
import Map from '@arcgis/core/Map'
import MapView from "@arcgis/core/views/MapView";
import SceneView from "@arcgis/core/views/SceneView";
import { LayerProps, layerTypeMapping } from "../types/mappingTypes";
import Color from "@arcgis/core/Color";

// Create a new map
export const createMap = () => {
    return new Map({
        basemap: 'topo-vector',
    })
}

// Create a new view
export const createView = (container: HTMLDivElement, map: Map, viewType: 'map' | 'scene' = 'scene') => {

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
        }
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
    // Create a layer based on the layer props
    if ('url' in layer) {

        return new LayerType({
            url: layer.url,
            ...layer.options,
        });
    }

    if (layer.type === 'group') {
        if (layer.layers) {
            // Create an array of group layers by mapping the layers and filtering out any undefined elements
            const groupedLayers = layer.layers.map(createLayer).filter(layer => layer !== undefined) as (FeatureLayer | TileLayer | GroupLayer | MapImageLayer)[];
            return groupedLayers;
        }
    }

    console.warn(`Missing URL in layer props: ${JSON.stringify(layer)}`);
    return undefined;

}

// Create a layer based on the layer props
export const createLayer = (layer: LayerProps): FeatureLayer | TileLayer | GroupLayer | MapImageLayer | undefined => {
    // Handle the special case for group layers
    if (layer.type === 'group' && layer.layers) {
        const groupLayers = layer.layers.map(createLayer).filter(layer => layer !== undefined) as (FeatureLayer | TileLayer | GroupLayer | MapImageLayer)[];
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