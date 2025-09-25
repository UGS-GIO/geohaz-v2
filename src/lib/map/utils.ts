import SceneView from '@arcgis/core/views/SceneView'
import MapView from '@arcgis/core/views/MapView'
import { GroupLayerProps, MapApp, WMSLayerProps } from '@/lib/types/mapping-types'
import GroupLayer from "@arcgis/core/layers/GroupLayer";
import ArcGISMap from '@arcgis/core/Map'
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
    if (app.view) {
        app.view.destroy();
    }
    const map = createMap();
    const view = createView(container, map, initialView, isMobile, { zoom, center });
    await addLayersToMap(map, layers);
    return { map, view };
}

export const createMap = () => {
    return new ArcGISMap({
        basemap: basemapList.find(item => item.isActive)?.basemapStyle,
    });
}

/**
 * Creates a MapView or SceneView instance.
 *
 * @param container - The HTMLDivElement that will contain the view.
 * @param map - The ArcGISMap instance to be displayed in the view.
 * @param viewType - The type of view to create, either 'map' or 'scene'. Defaults to 'scene'.
 * @param isMobile - A boolean indicating if the view is for a mobile device.
 * @param initialView - An object specifying the initial zoom level and center coordinates.
 * @returns A MapView or SceneView instance based on the viewType parameter.
 */
export const createView = (
    container: HTMLDivElement,
    map: ArcGISMap,
    viewType: 'map' | 'scene' = 'scene',
    isMobile: boolean,
    initialView: { zoom: number; center: [number, number] }
): __esri.MapView | __esri.SceneView => {
    const commonOptions = {
        container,
        map,
        zoom: initialView.zoom,
        center: initialView.center,
        ui: { components: ['zoom', 'compass', 'attribution'] },
        ...(!isMobile && {
            popup: new Popup({
                dockEnabled: true,
                dockOptions: { buttonEnabled: false, breakpoint: false, position: 'bottom-left' },
            }),
        }),
    };
    return viewType === 'scene' ? new SceneView(commonOptions) : new MapView(commonOptions);
};

/**
 * Adds layers to the map with WMS optimization by batching GetCapabilities requests but maintaining individual layer structure.
 *
 * @param map - The ArcGISMap instance to which layers will be added.
 * @param layersConfig - An array of LayerProps that defines the layers to be added to the map.
 * @returns A promise that resolves when the layers have been added to the map.
 */
export const addLayersToMap = async (map: ArcGISMap, layersConfig: LayerProps[]) => {
    // Step 1: Pre-fetch WMS capabilities by creating temporary combined layers
    const wmsLayerGroups: Record<string, WMSLayerProps[]> = {};
    const capabilitiesCache = new Map<string, any>();

    const collectWMSLayers = (layers: LayerProps[]) => {
        layers.forEach(layer => {
            if (layer.type === 'wms') {
                const wmsLayer = layer as WMSLayerProps;
                let groupKey = wmsLayer.url || 'default';
                if (Array.isArray(wmsLayer.sublayers) && wmsLayer.sublayers[0]?.name?.includes(':')) {
                    const workspace = wmsLayer.sublayers[0].name.split(':')[0];
                    groupKey = `${wmsLayer.url}::${workspace}`;
                }
                if (!wmsLayerGroups[groupKey]) wmsLayerGroups[groupKey] = [];
                wmsLayerGroups[groupKey].push(wmsLayer);
            } else if (layer.type === 'group') {
                collectWMSLayers((layer as GroupLayerProps).layers || []);
            }
        });
    };

    collectWMSLayers(layersConfig);

    // Pre-fetch capabilities using combined layers
    await Promise.all(
        Object.entries(wmsLayerGroups).map(async ([groupKey, wmsLayers]) => {
            try {
                const combinedLayer = createCombinedWMSLayerForFetching(wmsLayers);
                if (!combinedLayer) return;

                // Add temporarily to trigger capabilities loading
                map.add(combinedLayer);
                await combinedLayer.when();

                // Cache the capabilities info for this group
                capabilitiesCache.set(groupKey, {
                    loaded: true,
                    allSublayers: combinedLayer.allSublayers,
                    serviceInfo: (combinedLayer as any).serviceInfo
                });

                // Remove the temporary combined layer
                map.remove(combinedLayer);

            } catch (error) {
                console.warn(`Failed to pre-fetch capabilities for ${groupKey}:`, error);
            }
        })
    );

    // Step 2: Create individual layers normally (they should now load faster)
    const finalLayers = buildLayerTree(layersConfig);

    if (finalLayers.length > 0) {
        map.addMany(finalLayers.reverse());
    }
};

/**
 * Creates a combined WMS layer for fetching capabilities from an array of WMS layer properties.
 *
 * @param wmsLayers - An array of WMSLayerProps objects representing the WMS layers.
 * @returns A WMSLayer instance if at least one WMS layer is provided; otherwise, returns undefined.
 */
const createCombinedWMSLayerForFetching = (wmsLayers: WMSLayerProps[]): __esri.WMSLayer | undefined => {
    if (wmsLayers.length === 0) return undefined;
    const LayerType = layerTypeMapping['wms'];
    if (!LayerType) return undefined;

    const firstLayer = wmsLayers[0];
    const allSublayerNames = new Set<string>();
    wmsLayers.forEach(layer =>
        layer.sublayers?.forEach(sub => allSublayerNames.add(sub.name || ''))
    );

    return new LayerType({
        url: firstLayer.url,
        customLayerParameters: firstLayer.customLayerParameters,
        sublayers: Array.from(allSublayerNames).map(name => ({ name })),
        visible: false, // Hidden temporary layer
        title: `__TEMP_CAPABILITIES_${Date.now()}__`
    });
};

/**
 * Builds a tree of layers based on the provided layer configurations, creating individual layers normally.
 *
 * @param layerConfigs - An array of layer configuration objects that define the layers to be created.
 * @returns An array of created layers, filtered to exclude any null values resulting from errors.
 */
function buildLayerTree(layerConfigs: LayerProps[]): __esri.Layer[] {
    return layerConfigs
        .map(config => {
            try {
                if (config.type === 'wms') {
                    // Create individual WMS layers normally - capabilities should be cached from pre-fetch
                    return createLayer(config);
                }
                if (config.type === 'group') {
                    const groupConfig = config as GroupLayerProps;
                    const childLayers = buildLayerTree(groupConfig.layers || []);
                    return new GroupLayer({
                        title: groupConfig.title,
                        visible: groupConfig.visible,
                        layers: childLayers
                    });
                }
                return createLayer(config);
            } catch (error) {
                console.error(`Skipping invalid layer "${config.title}":`, error);
                return null;
            }
        })
        .filter((layer): layer is __esri.Layer => layer !== null);
}

/**
 * Creates a layer instance from layer properties.
 *
 * @param layer - The layer properties to create a layer from.
 * @returns The created layer instance.
 * @throws Error if the layer type is unsupported or required properties are missing.
 */
export const createLayer = (layer: LayerProps): __esri.Layer => {
    if (layer.type === 'group') {
        const typedLayer = layer as GroupLayerProps;
        const groupLayers = typedLayer.layers?.map(createLayer).filter(layer => layer !== undefined).reverse() as __esri.CollectionProperties<__esri.Layer> | undefined;
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

    if ('url' in layer && !layer.url) {
        throw new Error(`Missing "url" property for layer "${layer.title}" of type "${layer.type}"`);
    }

    return new LayerType({
        ...layer,
        ...('options' in layer ? layer.options : {})
    });
};

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
                xmin: bbox[0], ymin: bbox[1], xmax: bbox[2], ymax: bbox[3],
                spatialReference: { wkid: 4326 }
            })
        });
    }
}

export const isWMSLayer = (layer: LayerProps): layer is WMSLayerProps => layer.type === 'wms';
export const isGroupLayer = (layer: LayerProps): layer is GroupLayerProps => layer.type === 'group';
export const isWMSMapLayer = (layer: __esri.Layer): layer is __esri.WMSLayer => layer.type === 'wms';
export const isGroupMapLayer = (layer: __esri.Layer): layer is __esri.GroupLayer => layer.type === 'group';