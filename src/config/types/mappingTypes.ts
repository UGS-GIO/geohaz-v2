import FeatureLayer from "@arcgis/core/layers/FeatureLayer"
import GroupLayer from "@arcgis/core/layers/GroupLayer"
import ImageryLayer from "@arcgis/core/layers/ImageryLayer"
import MapImageLayer from "@arcgis/core/layers/MapImageLayer"
import TileLayer from "@arcgis/core/layers/TileLayer"
import MapView from "@arcgis/core/views/MapView"
import SceneView from "@arcgis/core/views/SceneView"

export type LayerType = 'feature' | 'tile' | 'map-image' | 'imagery' | 'group'
export interface LayerConfig {
    type: LayerType
    url?: string
    options?: object
    title?: string
    visible?: boolean
    layers?: LayerConfig[]
}

// Define a mapping of layer types to their corresponding classes
export const layerTypeMapping = {
    'feature': FeatureLayer,
    'tile': TileLayer,
    'map-image': MapImageLayer,
    'imagery': ImageryLayer,
    'group': GroupLayer,
    // Add other layer types here
};

export interface MapApp {
    view?: SceneView | MapView
}