import * as reactiveUtils from "@arcgis/core/core/reactiveUtils";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import GroupLayer from "@arcgis/core/layers/GroupLayer";
import MapImageLayer from "@arcgis/core/layers/MapImageLayer";
import TileLayer from "@arcgis/core/layers/TileLayer";
import MapView from "@arcgis/core/views/MapView";
import SceneView from "@arcgis/core/views/SceneView";
import { LayerConfig, layerTypeMapping } from "../types/mappingTypes";

// Helper function to reduce code duplication in createLayer
function createLayerFromUrl(layerConfig: LayerConfig, LayerType: any) {
    // Create a layer based on the layerConfig
    if ('url' in layerConfig) {
        return new LayerType({
            url: layerConfig.url,
            ...layerConfig.options,
        });
    }

    if (layerConfig.type === 'group') {
        if (layerConfig.layers) {
            // Create an array of group layers by mapping the layers and filtering out any undefined elements
            const groupedLayers = layerConfig.layers.map(createLayer).filter(layer => layer !== undefined) as (FeatureLayer | TileLayer | GroupLayer | MapImageLayer)[];
            return new GroupLayer({
                title: layerConfig.title,
                visible: layerConfig.visible,
                layers: groupedLayers
            });
        }
    }

    console.warn(`Missing URL in layerConfig: ${JSON.stringify(layerConfig)}`);
    return undefined;

}

export const createLayer = (layerConfig: LayerConfig): FeatureLayer | TileLayer | GroupLayer | MapImageLayer | undefined => {
    // Handle the special case for group layers
    if (layerConfig.type === 'group' && layerConfig.layers) {
        const groupLayers = layerConfig.layers.map(createLayer).filter(layer => layer !== undefined) as (FeatureLayer | TileLayer | GroupLayer | MapImageLayer)[];
        return new GroupLayer({
            title: layerConfig.title,
            visible: layerConfig.visible,
            layers: groupLayers
        });
    }

    // Get the LayerType from the mapping
    const LayerType = layerTypeMapping[layerConfig.type];

    // If the LayerType exists, create a new layer
    if (LayerType) {
        return createLayerFromUrl(layerConfig, LayerType);
    }

    console.warn(`Unsupported layer type: ${layerConfig.type}`);
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