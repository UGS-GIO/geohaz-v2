import FeatureLayer from "@arcgis/core/layers/FeatureLayer"
import GeoJSONLayer from "@arcgis/core/layers/GeoJSONLayer"
import GroupLayer from "@arcgis/core/layers/GroupLayer"
import ImageryLayer from "@arcgis/core/layers/ImageryLayer"
import MapImageLayer from "@arcgis/core/layers/MapImageLayer"
import TileLayer from "@arcgis/core/layers/TileLayer"
import MapView from "@arcgis/core/views/MapView"
import SceneView from "@arcgis/core/views/SceneView"

export type LayerType = 'feature' | 'tile' | 'map-image' | 'imagery' | 'group' | 'geojson'
export interface LayerProps {
    type: LayerType
    url?: string
    options?: object
    title?: string
    visible?: boolean
    layers?: LayerProps[]
}

// Define a mapping of layer types to their corresponding classes
export const layerTypeMapping = {
    'feature': FeatureLayer,
    'tile': TileLayer,
    'map-image': MapImageLayer,
    'imagery': ImageryLayer,
    'group': GroupLayer,
    'geojson': GeoJSONLayer
    // Add other layer types here
};

export type MapImageLayerRenderer = {
    label: string;
    imageData: string;
    id: string;
    url: string;
    title: string;
};

export type RegularLayerRenderer = {
    renderer: __esri.Symbol;
    id: string;
    label: string;
    url: string;
};

export type RendererProps = { MapImageLayerRenderer: MapImageLayerRenderer[], RegularLayerRenderer: RegularLayerRenderer[] }

export interface MapApp {
    view?: SceneView | MapView
}


type MapImageLayerLegendItem = {
    label: string;
    url: string;
    imageData: string;
    contentType: string;
    groupId: string;
    height: number;
    width: number;
    values?: string[];
};

type MapImageLayerLegendGroup = {
    id: string;
    heading: string;
};

type MapImageLayerLayer = {
    layerId: number;
    layerName: string;
    layerType: string;
    minScale: number;
    maxScale: number;
    legend: MapImageLayerLegendItem[];
    legendGroups: MapImageLayerLegendGroup[];
};

export type MapImageLayerType = {
    layers: MapImageLayerLayer[];
};

export type GetRenderer = (layerId: string, url: string | undefined) => Promise<RendererProps | undefined>;

export type LayerConstructor = typeof FeatureLayer | typeof TileLayer | typeof GroupLayer | typeof MapImageLayer | typeof GeoJSONLayer | typeof ImageryLayer | undefined;

export type UIPositionOptions = "bottom-leading" | "bottom-left" | "bottom-right" | "bottom-trailing" | "top-leading" | "top-left" | "top-right" | "top-trailing" | "manual"

export type GetResultsHandlerType = { exactMatch: boolean, location: __esri.Point, maxResults: number, sourceIndex: number, spatialReference: __esri.SpatialReference, suggestResult: __esri.SuggestResult, view: __esri.MapView | __esri.SceneView }

export type GetSuggestionsHandlerType = { exactMatch: boolean, location: __esri.Point, maxResults: number, sourceIndex: number, spatialReference: __esri.SpatialReference, suggestResult: __esri.SuggestResult, view: __esri.MapView | __esri.SceneView }

