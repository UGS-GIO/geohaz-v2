import SceneView from '@arcgis/core/views/SceneView'
import MapView from '@arcgis/core/views/MapView'
import { GroupLayerProps, LayerConstructor, MapApp, WMSLayerProps } from '@/lib/types/mapping-types'
import GroupLayer from "@arcgis/core/layers/GroupLayer";
import Map from '@arcgis/core/Map'
import { LayerProps, layerTypeMapping } from "@/lib/types/mapping-types";
import Popup from "@arcgis/core/widgets/Popup";
import { basemapList } from '@/components/top-nav';
import { ExtendedFeature } from '@/components/custom/popups/popup-content-with-pagination';
import { convertBbox } from '@/lib/map/conversion-utils';
import Extent from '@arcgis/core/geometry/Extent';


const app: MapApp = {};

export function findLayerByTitle(mapInstance: __esri.Map, title: string): __esri.Layer | null {
    let foundLayer: __esri.Layer | null = null;
    mapInstance.layers.forEach(layer => {
        if (layer.title === title) {
            foundLayer = layer;
        } else if (layer.type === 'group') {
            const groupLayer = layer as __esri.GroupLayer;
            // Search within sublayers of a group layer
            const subLayer = groupLayer.layers.find(childLayer => childLayer.title === title);
            if (subLayer) {
                foundLayer = subLayer;
            }
        }
    });
    return foundLayer;
}

/**
 * Initializes a map and its view within a specified container.
 *
 * @param container - The HTMLDivElement that will contain the map view.
 * @param isMobile - A boolean indicating if the view should be optimized for mobile devices.
 * @param options - An object containing the initial zoom level and center coordinates.
 * @param layers - An array of layer properties to be added to the map.
 * @param initialView - An optional parameter that specifies whether to initialize as a 'map' or 'scene' view.
 * @returns A promise that resolves to an object containing the initialized map and view.
 */
export async function init(
    container: HTMLDivElement,
    isMobile: boolean,
    { zoom, center }: { zoom: number, center: [number, number] },
    layers: LayerProps[],
    initialView?: 'map' | 'scene',
): Promise<{ map: __esri.Map, view: __esri.MapView | __esri.SceneView }> {
    // Destroy the view if it exists
    if (app.view) {
        app.view.destroy();
    }

    // Create a new map and view
    const map = createMap();

    // Create the view
    const view = createView(container, map, initialView, isMobile, { zoom, center });

    // Add layers to the map
    await addLayersToMap(map, layers);

    return { map, view };
}

// Create a new map
export const createMap = () => {
    const map = new Map({
        basemap: basemapList.find(item => item.isActive)?.basemapStyle, // Default basemap
    });
    return map;
}

// Create a new view
export const createView = (
    container: HTMLDivElement,
    map: Map,
    viewType: 'map' | 'scene' = 'scene',
    isMobile: boolean,
    initialView: { zoom: number; center: [number, number] } // Changed to [number, number] for more flexibility
) => {
    // Common options for both MapView and SceneView
    const commonOptions = {
        container,
        map,
        zoom: initialView.zoom,
        center: initialView.center,
        // highlightOptions: {
        //     color: new Color([255, 255, 0, 1]),
        //     haloColor: new Color("white"),
        //     haloOpacity: 0.9,
        //     fillOpacity: 0.2,
        // },
        ui: {
            components: ['zoom', 'compass', 'attribution'],
        },
        ...(!isMobile && {
            popup: new Popup({
                dockEnabled: true,
                dockOptions: {
                    buttonEnabled: false,
                    breakpoint: false,
                    position: 'bottom-left',
                },
            }),
        }),
    };

    return viewType === 'scene'
        ? new SceneView({ ...commonOptions })
        : new MapView({ ...commonOptions });
};

/**
 * Adds layers to the map with WMS optimization by batching GetCapabilities requests but maintaining individual layer structure.
 *
 * @param map - The ArcGISMap instance to which layers will be added.
 * @param layersConfig - An array of LayerProps that defines the layers to be added to the map.
 * @returns A promise that resolves when the layers have been added to the map.
 */
export const addLayersToMap = async (map: Map, layersConfig: LayerProps[]) => {
    // Create all layers first
    const createdLayers: __esri.Layer[] = [];

    for (const layer of layersConfig) {
        const createdLayer = createLayer(layer) as __esri.Layer;
        if (createdLayer) {
            createdLayers.push(createdLayer);
        }
    }

    // Add all layers at once in reverse order to maintain the correct drawing order
    if (createdLayers.length > 0) {
        map.addMany(createdLayers.reverse());
    }
}

/**
 * Creates a layer from the given URL and layer properties.
 *
 * @param layer - The properties of the layer to create.
 * @param LayerType - The constructor for the layer type.
 * @returns The created layer instance or undefined if the layer type is unsupported or if the URL is missing.
 */
function createLayerFromUrl(layer: LayerProps, LayerType: LayerConstructor) {
    if (!LayerType) {
        console.warn(`Unsupported layer type: ${layer.type}`);
        return undefined;
    }

    if (layer.type === 'wms') {
        const typedLayer = layer as WMSLayerProps;
        return new LayerType({
            url: typedLayer.url,
            title: typedLayer.title,
            visible: typedLayer.visible,
            sublayers: typedLayer.sublayers,
            opacity: layer.opacity,
            customLayerParameters: typedLayer.customLayerParameters,
        });
    }

    if (layer.url) {
        return new LayerType({
            url: layer.url,
            title: layer.title,
            visible: layer.visible,
            opacity: layer.opacity,
            ...layer.options,
        });
    }

    console.warn(`Missing URL in layer props: ${JSON.stringify(layer)}`);
    return undefined;
}

/**
 * Creates a layer instance from layer properties.
 *
 * @param layer - The layer properties to create a layer from.
 * @returns The created layer instance.
 * @throws Error if the layer type is unsupported or required properties are missing.
 */
export const createLayer = (layer: LayerProps) => {
    if (layer.type === 'group') {
        const typedLayer = layer as GroupLayerProps;
        // Recursively create group layers and reverse the order
        const groupLayers = typedLayer.layers?.map(createLayer).filter(layer => layer !== undefined).reverse() as __esri.CollectionProperties<__esri.Layer> | undefined;
        return new GroupLayer({
            title: layer.title,
            visible: layer.visible,
            layers: groupLayers,
        });
    }

    const LayerType = layerTypeMapping[layer.type];

    if (LayerType) {
        return createLayerFromUrl(layer, LayerType);
    }

    console.warn(`Unsupported layer type: ${layer.type}`);
    return undefined;
}

/**
 * Zooms the map or scene view to the bounding box of the specified feature.
 *
 * @param feature - The feature to zoom to, which must include a bounding box (bbox).
 * @param view - The MapView or SceneView instance to perform the zoom action on.
 * @param sourceCRS - The coordinate reference system of the feature's bounding box.
 */
export const zoomToFeature = (
    feature: ExtendedFeature,
    view: __esri.MapView | __esri.SceneView,
    sourceCRS: string
) => {
    if (feature.bbox) {
        const bbox = convertBbox(feature.bbox, sourceCRS);

        view?.goTo({
            target: new Extent({
                xmin: bbox[0],
                ymin: bbox[1],
                xmax: bbox[2],
                ymax: bbox[3],
                spatialReference: { wkid: 4326 }
            })
        });
    }
}

// Type guard to check if the layer is a WMSLayerProps
export const isWMSLayer = (layer: LayerProps): layer is WMSLayerProps => {
    return layer.type === 'wms';
}

// Type guard to check if the layer is a GroupLayerProps
export const isGroupLayer = (layer: LayerProps): layer is GroupLayerProps => {
    return layer.type === 'group';
}

export const isWMSMapLayer = (layer: __esri.Layer): layer is __esri.WMSLayer => {
    return layer.type === 'wms';
}

export const isGroupMapLayer = (layer: __esri.Layer): layer is __esri.GroupLayer => {
    return layer.type === 'group';
}