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

export function init(
    container: HTMLDivElement,
    isMobile: boolean,
    { zoom, center }: { zoom: number, center: [number, number] },
    layers: LayerProps[],
    initialView?: 'map' | 'scene',
): { map: __esri.Map, view: __esri.MapView | __esri.SceneView } {
    // Destroy the view if it exists
    if (app.view) {
        app.view.destroy();
    }

    // Create a new map and view
    const map = createMap();

    // Create the view
    const view = createView(container, map, initialView, isMobile, { zoom, center });

    // Add layers to the map
    addLayersToMap(map, layers);

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

// Dynamically add layers to the map
export const addLayersToMap = (map: Map, layers: LayerProps[]) => {
    // Add layers to the map in reverse order to maintain the correct drawing order
    layers.reverse().forEach((layer: LayerProps) => {
        const createdLayer = createLayer(layer) as __esri.Layer;
        if (createdLayer) {
            map.add(createdLayer)
        }
    })
}

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

interface Bbox {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
}

interface CreateBboxProps {
    mapPoint: __esri.Point;
    resolution?: number;
    buffer?: number;
}

// Create a bounding box around the clicked map point
export function createBbox({ mapPoint, resolution = 1, buffer = 10 }: CreateBboxProps): Bbox {
    // Apply buffer and scale it by resolution if needed
    const scaleFactor = 50; // Scale factor calculated above

    // Apply buffer and scale it by resolution and the calculated scale factor
    const scaledBuffer = buffer * resolution * scaleFactor;

    const minX = mapPoint.x - scaledBuffer;
    const minY = mapPoint.y - scaledBuffer;
    const maxX = mapPoint.x + scaledBuffer;
    const maxY = mapPoint.y + scaledBuffer;

    return {
        minX,
        minY,
        maxX,
        maxY,
    };
}

export const zoomToFeature = (
    feature: ExtendedFeature,
    view: __esri.MapView | __esri.SceneView
) => {
    if (feature.bbox) {
        const bbox = convertBbox(feature.bbox);

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
