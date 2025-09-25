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
            const subLayer = groupLayer.layers.find(childLayer => childLayer.title === title);
            if (subLayer) {
                foundLayer = subLayer;
            }
        }
    });
    return foundLayer;
}

/** Initializes the map application by creating a new map and view, and adding layers.
 * @param {HTMLDivElement} container - The HTML container element for the map view.
 * @param {boolean} isMobile - Flag indicating if the device is mobile.
 * @param {{ zoom: number, center: [number, number] }} initialView - Initial zoom level and center coordinates.
 * @param {LayerProps[]} layers - Array of layer properties to add to the map.
 * @param {'map' | 'scene'} [initialView='scene'] - Type of view to create ('map' for 2D, 'scene' for 3D).
 * @returns {{ map: __esri.Map, view: __esri.MapView | __esri.SceneView }} The created map and view instances.
 * */
export function init(
    container: HTMLDivElement,
    isMobile: boolean,
    { zoom, center }: { zoom: number, center: [number, number] },
    layers: LayerProps[],
    initialView?: 'map' | 'scene',
): { map: __esri.Map, view: __esri.MapView | __esri.SceneView } {
    if (app.view) {
        app.view.destroy();
    }

    // Create a new map and view
    const map = createMap();

    // Create the view
    const view = createView(container, map, initialView, isMobile, { zoom, center });

    // Add layers to the map with optimization
    addLayersToMap(map, layers);

    return { map, view };
}

/** Creates and returns a new ArcGIS Map instance with the active basemap.
 * @returns {__esri.Map} The created Map instance.
 * */
export const createMap = () => {
    const map = new Map({
        basemap: basemapList.find(item => item.isActive)?.basemapStyle,
    });
    return map;
}

/** Creates and returns a new MapView or SceneView instance based on the specified type.
 * @param {HTMLDivElement} container - The HTML container element for the map view.
 * @param {__esri.Map} map - The ArcGIS Map instance to associate with the view.
 * @param {'map' | 'scene'} [viewType='scene'] - Type of view to create ('map' for 2D, 'scene' for 3D).
 * @param {boolean} isMobile - Flag indicating if the device is mobile.
 * @param {{ zoom: number, center: [number, number] }} initialView - Initial zoom level and center coordinates.
 * @returns {__esri.MapView | __esri.SceneView} The created MapView or SceneView instance.
 * */
export const createView = (
    container: HTMLDivElement,
    map: Map,
    viewType: 'map' | 'scene' = 'scene',
    isMobile: boolean,
    initialView: { zoom: number; center: [number, number] }
) => {
    const commonOptions = {
        container,
        map,
        zoom: initialView.zoom,
        center: initialView.center,
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

/** Adds multiple layers to the map, with true WMS optimization using combined layers only.
 * NOTE: This approach trades individual layer control for maximum network efficiency.
 * @param {__esri.Map} map - The ArcGIS Map instance to add layers to.
 * @param {LayerProps[]} layers - Array of layer properties to add to the map.
 * */
export const addLayersToMap = (map: Map, layers: LayerProps[]) => {
    // Extract all WMS layers and group by server + workspace
    const wmsLayerGroups: Record<string, WMSLayerProps[]> = {};
    const processedLayers: __esri.Layer[] = [];

    const processLayer = (layer: LayerProps): __esri.Layer | null => {
        if (layer.type === 'wms') {
            const wmsLayer = layer as WMSLayerProps;
            let groupKey: string = wmsLayer.url || 'default';

            if (wmsLayer.sublayers && Array.isArray(wmsLayer.sublayers) && wmsLayer.sublayers.length > 0) {
                const firstSublayer = wmsLayer.sublayers[0];
                if (firstSublayer?.name && firstSublayer.name.includes(':')) {
                    const workspace = firstSublayer.name.split(':')[0];
                    groupKey = `${wmsLayer.url}::${workspace}`;
                }
            }

            if (!wmsLayerGroups[groupKey]) {
                wmsLayerGroups[groupKey] = [];
            }
            wmsLayerGroups[groupKey].push(wmsLayer);
            return null; // Will be created as combined layer
        }
        else if (layer.type === 'group') {
            const groupLayer = layer as GroupLayerProps;
            const childLayers = groupLayer.layers?.map(processLayer).filter((layer): layer is __esri.Layer => layer !== null) || [];

            return new GroupLayer({
                title: layer.title,
                visible: layer.visible,
                layers: childLayers as __esri.CollectionProperties<__esri.Layer>,
            });
        }
        else {
            return createLayer(layer);
        }
    };

    // Process all layers
    layers.forEach(layer => {
        const processedLayer = processLayer(layer);
        if (processedLayer) {
            processedLayers.push(processedLayer);
        }
    });

    // Create combined WMS layers
    const combinedWMSLayers: __esri.Layer[] = [];
    Object.entries(wmsLayerGroups).forEach(([groupKey, wmsLayers]) => {
        const combinedLayer = createOptimizedWMSLayer(wmsLayers, groupKey);
        if (combinedLayer) {
            combinedWMSLayers.push(combinedLayer);
        }
    });

    const originalWMSCount = Object.values(wmsLayerGroups).reduce((total, group) => total + group.length, 0);
    const optimizedWMSCount = Object.keys(wmsLayerGroups).length;

    console.log(`🚀 WMS Optimization: Reduced ${originalWMSCount} individual WMS requests to ${optimizedWMSCount} combined requests`);
    console.warn(`⚠️  Note: Individual WMS layer control is limited - using ${optimizedWMSCount} combined layers for efficiency`);

    // Add all layers
    const allLayers = [...processedLayers, ...combinedWMSLayers];
    if (allLayers.length > 0) {
        map.addMany(allLayers.reverse());
    }
}

/** Creates an optimized WMS layer by combining multiple WMS layers into a single layer for efficient loading.
 * @param {WMSLayerProps[]} wmsLayers - An array of WMSLayerProps objects representing the WMS layers to combine.
 * @param {string} groupKey - A string used to determine the workspace name for the combined layer title.
 * @returns {__esri.Layer | undefined} A Layer object for batched loading; undefined if no layers provided.
 * */
const createOptimizedWMSLayer = (wmsLayers: WMSLayerProps[], groupKey: string): __esri.Layer | undefined => {
    if (wmsLayers.length === 0) return undefined;

    const LayerType = layerTypeMapping['wms'];
    if (!LayerType) return undefined;

    const firstLayer = wmsLayers[0];

    // Combine all sublayers from all WMS layers in this group
    const allSublayers: any[] = [];
    let hasVisibleLayer = false;

    wmsLayers.forEach(layer => {
        if (layer.sublayers && Array.isArray(layer.sublayers)) {
            // Preserve original visibility settings
            const modifiedSublayers = layer.sublayers.map(sublayer => ({
                ...sublayer,
                visible: layer.visible !== false,
            }));
            allSublayers.push(...modifiedSublayers);

            if (layer.visible !== false) {
                hasVisibleLayer = true;
            }
        }
    });

    // Extract workspace name for title
    const workspace = groupKey.includes('::')
        ? groupKey.split('::')[1]
        : 'Combined';

    const title = wmsLayers.length === 1
        ? wmsLayers[0].title
        : `${workspace.charAt(0).toUpperCase() + workspace.slice(1)} Layers (${wmsLayers.length} combined)`;

    return new LayerType({
        url: firstLayer.url,
        title,
        visible: hasVisibleLayer,
        sublayers: allSublayers,
        opacity: firstLayer.opacity || 1,
        customLayerParameters: firstLayer.customLayerParameters,
    });
}

// /** Creates a layer instance from the given layer properties and layer constructor.
//  * @param {LayerProps} layer - The properties of the layer to create.
//  * @param {LayerConstructor} LayerType - The constructor function for the specific layer type.
//  * @return {__esri.FeatureLayer | __esri.GeoJSONLayer | __esri.MapImageLayer | __esri.WMSLayer | __esri.TileLayer | __esri.ImageryLayer | undefined} The created layer instance, or undefined if creation failed.
//  * */
// function createLayerFromUrl(layer: LayerProps, LayerType: LayerConstructor) {
//     if (!LayerType) {
//         console.warn(`Unsupported layer type: ${layer.type}`);
//         return undefined;
//     }

//     if (layer.type === 'wms') {
//         const typedLayer = layer as WMSLayerProps;
//         return new LayerType({
//             url: typedLayer.url,
//             title: typedLayer.title,
//             visible: typedLayer.visible,
//             sublayers: typedLayer.sublayers,
//             opacity: layer.opacity,
//             customLayerParameters: typedLayer.customLayerParameters,
//         });
//     }

//     if (layer.url) {
//         return new LayerType({
//             url: layer.url,
//             title: layer.title,
//             visible: layer.visible,
//             opacity: layer.opacity,
//             ...layer.options,
//         });
//     }

//     console.warn(`Missing URL in layer props: ${JSON.stringify(layer)}`);
//     return undefined;
// }

/** Recursively creates a layer (or group layer) from the given layer properties.
 * @param {LayerProps} layer - The properties of the layer to create.
 * @return {GroupLayer | __esri.FeatureLayer | __esri.GeoJSONLayer | __esri.MapImageLayer | __esri.WMSLayer | __esri.TileLayer | __esri.ImageryLayer | undefined} The created layer instance, or undefined if creation failed.
 * */
/**
 * Recursively creates a layer (or group layer) from the given layer properties.
 * This function will throw an error if layer creation fails.
 * @param {LayerProps} layer - The properties of the layer to create.
 * @returns {__esri.Layer} The created layer instance.
 * @throws {Error} If the layer type is unsupported or required properties are missing.
 */
export const createLayer = (layer: LayerProps): __esri.Layer => {
    if (layer.type === 'group') {
        const typedLayer = layer as GroupLayerProps;
        const groupLayers = typedLayer.layers
            ?.map(childLayer => {
                try {
                    // Recursively call createLayer and catch any errors from children
                    return createLayer(childLayer);
                } catch (error) {
                    console.error(`Skipping invalid layer in group "${typedLayer.title}":`, error);
                    return null; // Return null to be filtered out
                }
            })
            .filter((layer): layer is __esri.Layer => layer !== null) // Filter out nulls
            .reverse() as __esri.CollectionProperties<__esri.Layer> | undefined;

        return new GroupLayer({
            title: layer.title,
            visible: layer.visible,
            layers: groupLayers,
        });
    }

    const LayerType = layerTypeMapping[layer.type];

    if (!LayerType) {
        throw new Error(`Unsupported layer type: "${layer.type}"`);
    }

    // Check for a URL on layer types that require it
    if ('url' in layer && !layer.url) {
        throw new Error(`Missing "url" property for layer "${layer.title}" of type "${layer.type}"`);
    }

    // Create the layer instance with all available properties
    return new LayerType({
        ...layer, // Pass all properties from the config object
        ...layer.options, // Spread any additional options
    });
};

/** Zooms the map view to the extent of the given feature, converting the bounding box if necessary.
 * @param {ExtendedFeature} feature - The feature to zoom to, which may include a bounding box.
 * @param {__esri.MapView | __esri.SceneView} view - The map view to perform the zoom action on.
 * @param {string} sourceCRS - The coordinate reference system of the feature's bounding box.
 * */
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

/** Type guard to check if a layer is a WMS layer.
 * @param {LayerProps} layer - The layer to check.
 * @returns {layer is WMSLayerProps} True if the layer is a WMS layer.
 * */
export const isWMSLayer = (layer: LayerProps): layer is WMSLayerProps => {
    return layer.type === 'wms';
}

/** Type guard to check if a layer is a group layer.
 * @param {LayerProps} layer - The layer to check.
 * @returns {layer is GroupLayerProps} True if the layer is a group layer.
 * */
export const isGroupLayer = (layer: LayerProps): layer is GroupLayerProps => {
    return layer.type === 'group';
}

/** Type guard to check if a map layer is a WMS layer.
 * @param {__esri.Layer} layer - The map layer to check.
 * @returns {layer is __esri.WMSLayer} True if the map layer is a WMS layer.
 * */
export const isWMSMapLayer = (layer: __esri.Layer): layer is __esri.WMSLayer => {
    return layer.type === 'wms';
}

/** Type guard to check if a map layer is a group layer.
 * @param {__esri.Layer} layer - The map layer to check.
 * @returns {layer is __esri.GroupLayer} True if the map layer is a group layer.
 * */
export const isGroupMapLayer = (layer: __esri.Layer): layer is __esri.GroupLayer => {
    return layer.type === 'group';
}