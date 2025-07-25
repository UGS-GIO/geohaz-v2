import SceneView from '@arcgis/core/views/SceneView'
import MapView from '@arcgis/core/views/MapView'
import { GroupLayerProps, LayerConstructor, MapApp, MapImageLayerType, WMSLayerProps } from '@/lib/types/mapping-types'
import * as reactiveUtils from "@arcgis/core/core/reactiveUtils";
import GroupLayer from "@arcgis/core/layers/GroupLayer";
import Map from '@arcgis/core/Map'
import { LayerProps, layerTypeMapping } from "@/lib/types/mapping-types";
import Popup from "@arcgis/core/widgets/Popup";
import Graphic from "@arcgis/core/Graphic.js";
import Polyline from "@arcgis/core/geometry/Polyline.js";
import { Feature, GeoJsonProperties, Geometry } from 'geojson';
import { createEsriSymbol } from '@/lib/legend/symbol-generator';
import { Legend } from '@/lib/types/geoserver-types';
import Point from "@arcgis/core/geometry/Point.js";
import Polygon from '@arcgis/core/geometry/Polygon';
import proj4 from 'proj4';
import { ExtendedFeature } from '@/components/custom/popups/popup-content-with-pagination';
import Extent from '@arcgis/core/geometry/Extent';
import { basemapList } from '@/components/top-nav';
import WMSSublayer from "@arcgis/core/layers/support/WMSSublayer.js";
import SimpleLineSymbol from '@arcgis/core/symbols/SimpleLineSymbol';
import SimpleMarkerSymbol from '@arcgis/core/symbols/SimpleMarkerSymbol';
import SimpleFillSymbol from '@arcgis/core/symbols/SimpleFillSymbol';
import UniqueValueRenderer from "@arcgis/core/renderers/UniqueValueRenderer.js";
import SimpleRenderer from "@arcgis/core/renderers/SimpleRenderer.js";
import { LayerOrderConfig } from '@/hooks/use-get-layer-config';

// Create a global app object to store the view
const app: MapApp = {};

// Fetch the renderer for a given layer ID
export const getRenderer = async function (
    view: SceneView | MapView,
    map: __esri.Map,
    id: string
) {
    const layer = findLayerById(map.layers, id);

    await view.when();
    if (!layer) {
        console.error(`Layer with id ${id} not found`);
        return;
    }

    switch (layer.type) {
        case 'group':
            return await getGroupLayerRenderer(layer as __esri.GroupLayer);
        case 'map-image':
            return await getMapImageLayerRenderer(layer as __esri.MapImageLayer);
        case 'feature':
            return await getFeatureLayerRenderer(layer as __esri.FeatureLayer);
        case 'wms':
            return await getWMSLayerRenderer(layer as __esri.WMSLayer);
        default:
            console.error('Layer type not supported:', layer.type);
            return;
    }
};

const getGroupLayerRenderer = async (layer: __esri.GroupLayer) => {
    for (const sublayer of layer.allLayers) {
        try {
            switch (sublayer.type) {
                case 'feature':
                    return await getFeatureLayerRenderer(sublayer as __esri.FeatureLayer);
                case 'map-image':
                    return await getMapImageLayerRenderer(sublayer as __esri.MapImageLayer);
                case 'wms':
                    return await getWMSLayerRenderer(sublayer as __esri.WMSLayer);
                default:
                    console.error('Unsupported GroupLayer type:', sublayer.type);
            }
        } catch (error) {
            console.error('Error processing sublayer:', sublayer.type, error);
        }
    }
};

const getMapImageLayerRenderer = async (layer: __esri.MapImageLayer) => {
    const response = await fetch(`${layer.url}/legend?f=pjson`);
    const legend: MapImageLayerType = await response.json();
    const legendEntries = legend.layers[0]?.legend;

    if (legendEntries && legendEntries.length > 0) {
        const allRenderers = legendEntries.map(entry => ({
            type: 'map-image-renderer',
            label: entry.label,
            imageData: entry.imageData,
            id: layer.id,
            url: layer.url,
            title: layer.title,
        }));

        return allRenderers;
    }

    console.error('No legend data found for MapImageLayer.');
    return;
};

const getFeatureLayerRenderer = async (layer: __esri.FeatureLayer) => {
    if (layer.renderer?.type === 'unique-value') {
        const renderer = new UniqueValueRenderer(layer.renderer);
        return renderer.uniqueValueInfos?.map(info => ({
            type: 'regular-layer-renderer',
            renderer: info.symbol,
            id: layer.id,
            label: info.label,
            url: layer.url,
        }));
    } else if (layer.renderer?.type === 'simple') {
        const renderer = new SimpleRenderer(layer.renderer);
        return [{
            type: 'regular-layer-renderer',
            renderer: renderer.symbol,
            id: layer.id,
            label: layer.title,
            url: layer.url,
        }];
    } else {
        console.error('Unsupported renderer type for FeatureLayer.');
        return [{
            type: 'regular-layer-renderer',
            renderer: new SimpleRenderer(),
            id: layer.id,
            label: layer.title,
            url: layer.url,
        }];
    }
};

const getWMSLayerRenderer = async (layer: __esri.WMSLayer) => {
    const sublayer: __esri.WMSSublayer = layer.sublayers.getItemAt(0) || new WMSSublayer(); // we are currently only supporting the first sublayer, but a wms layer can have multiple sublayers

    const legendUrl = `${layer.url}?service=WMS&request=GetLegendGraphic&format=application/json&layer=${sublayer.name}`;

    try {
        const response = await fetch(legendUrl, {
            method: 'GET',
            headers: { Accept: 'application/json' },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status} for sublayer ${sublayer.name}`);
        }

        const legendData: Legend = await response.json();

        const rules = legendData?.Legend?.[0]?.rules || []; // Get all rules for the first legend

        if (rules.length === 0) {
            console.warn('No rules found in the legend data.');
            return;
        }

        // Map through all the rules and generate preview objects for each rule
        const previews = rules.map((rule) => ({
            type: 'regular-layer-renderer',
            label: rule.title,
            renderer: createEsriSymbol(rule.symbolizers),
            id: layer.id.toString(),
            url: layer.url,
        }));

        return previews; // Return an array of all previews
    } catch (error) {
        console.error('Error fetching WMS legend data:', error);
    }
    return [];
};

export const findLayerById = (layers: __esri.Collection<__esri.Layer>, id: string): __esri.Layer | undefined => {
    let foundLayer: __esri.Layer | undefined;

    layers.forEach(layer => {
        if (layer.id === id) {
            foundLayer = layer;
        } else if (layer instanceof GroupLayer) {
            const childLayer = findLayerById(layer.layers, id);
            if (childLayer) {
                foundLayer = childLayer;
            }
        }
    });
    return foundLayer;
};

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

    // Prevent collision with the edges of the view
    setPopupAlignment(view);

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

// Set the popup alignment based on the location of the popup
export function setPopupAlignment(view: SceneView | MapView) {
    reactiveUtils.watch(() => view.popup?.id, function () {

        if (view && view.popup) {
            view.popup.alignment = function () {
                const { location, view } = this;

                if ((location) && (view)) {
                    const viewPoint = view.toScreen(location) || new Point();
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
        }

    });
}

// Reorder layers based on the specified order config. this is useful for reordering layers in the popup
export const reorderLayers = (layerInfo: any[], layerOrderConfigs: LayerOrderConfig[]) => {

    // First, create an object to map layer names to their desired positions
    const layerPositions: Record<string, number> = {};

    // Loop through layerOrderConfigs and assign positions
    layerOrderConfigs.forEach(config => {
        if (config.position === 'start') {
            layerPositions[config.layerName] = -Infinity; // Move to the front
        } else if (config.position === 'end') {
            layerPositions[config.layerName] = Infinity;  // Move to the back
        }
    });

    // Now, sort the layers based on these positions
    return layerInfo.sort((a, b) => {
        // Determine the title to use for layer A (considering empty layerTitle)
        const aLayerTitle = a.layerTitle.trim() || a.groupLayerTitle.trim() || "Unnamed Layer";
        // Determine the title to use for layer B
        const bLayerTitle = b.layerTitle.trim() || b.groupLayerTitle.trim() || "Unnamed Layer";

        // Get positions from the layerPositions map (default to 0 if not found)
        const aPosition = layerPositions[aLayerTitle] ?? 0;
        const bPosition = layerPositions[bLayerTitle] ?? 0;

        // Compare positions
        return aPosition - bPosition;
    });
};

export function convertDDToDMS(dd: number, isLongitude: boolean = false) {
    const dir = dd < 0
        ? isLongitude ? 'W' : 'S'
        : isLongitude ? 'E' : 'N';

    const absDd = Math.abs(dd);
    const degrees = Math.floor(absDd);
    const minutes = Math.floor((absDd - degrees) * 60);
    const seconds = Math.round(((absDd - degrees) * 60 - minutes) * 60);

    // Pad degrees, minutes, and seconds with leading zeros if they're less than 10
    const degreesStr = degrees.toString().padStart(2, '0');
    const minutesStr = minutes.toString().padStart(2, '0');
    const secondsStr = seconds.toString().padStart(2, '0');

    return `${degreesStr}° ${minutesStr}' ${secondsStr}" ${dir}`;
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
function createBbox({ mapPoint, resolution = 1, buffer = 10 }: CreateBboxProps): Bbox {
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

interface WMSQueryProps {
    mapPoint: __esri.Point;
    view: __esri.MapView | __esri.SceneView;
    layers: string[];
    url: string;
    version?: '1.1.1' | '1.3.0';
    headers?: Record<string, string>;
    infoFormat?: string;
    buffer?: number;
    featureCount?: number;
    cql_filter?: string | null;
}

export async function fetchWMSFeatureInfo({
    mapPoint,
    view,
    layers,
    url,
    version = '1.3.0',
    headers = {},
    infoFormat = 'application/json',
    buffer = 10,
    featureCount = 50,
    cql_filter = null
}: WMSQueryProps) {

    if (layers.length === 0) {
        console.warn('No layers specified to query.');
        return null;
    }

    const bbox = createBbox({
        mapPoint,
        resolution: view.resolution,
        buffer
    });

    const { minX, minY, maxX, maxY } = bbox;

    // Different versions handle coordinates differently
    const bboxString = version === '1.1.1'
        ? `${minY},${minX},${maxY},${maxX}` // 1.1.0 uses lat,lon order
        : `${minX},${minY},${maxX},${maxY}`; // 1.3.1 uses lon,lat order

    const params = new URLSearchParams();

    // Add base parameters
    params.set('service', 'WMS');
    params.set('request', 'GetFeatureInfo');
    params.set('version', version);
    params.set('layers', layers.join(','));
    params.set('query_layers', layers.join(','));
    params.set('info_format', infoFormat);
    params.set('bbox', bboxString);
    params.set('crs', 'EPSG:3857');
    params.set('width', view.width.toString());
    params.set('height', view.height.toString());
    params.set('feature_count', featureCount.toString());

    // Add version-specific pixel coordinates
    if (version === '1.3.0') {
        params.set('i', Math.round(view.width / 2).toString());
        params.set('j', Math.round(view.height / 2).toString());
    } else {
        params.set('x', Math.round(view.width / 2).toString());
        params.set('y', Math.round(view.height / 2).toString());
    }

    if (cql_filter) {
        params.set('cql_filter', cql_filter);
    }

    const response = await fetch(`${url}?${params.toString()}`, { headers });

    if (!response.ok) {
        throw new Error(`GetFeatureInfo request failed with status ${response.status}`);
    }

    const data = await response.json();

    // Handle both raster and vector responses
    if (data.results) {
        // Raster response
        return data.results[0]?.value;
    } else if (data.features) {
        // Vector response - add namespaces
        const namespaceMap = layers.reduce((acc, layer) => {
            const [namespace, layerName] = layer.split(':');
            if (namespace && layerName) {
                acc[layerName] = namespace;
            }
            return acc;
        }, {} as Record<string, string>);

        const featuresWithNamespace = data.features.map((feature: any) => {
            const layerName = feature.id?.split('.')[0];
            const namespace = namespaceMap[layerName] || null;
            return {
                ...feature,
                namespace,
            };
        });

        return { ...data, features: featuresWithNamespace };
    }

    return data;
}

export async function fetchWfsGeometry({ namespace, feature }: { namespace: string; feature: ExtendedFeature }) {
    const featureId = feature.id!.toString()
    const layerName = featureId.split('.')[0];
    const ogcFid = feature.properties?.ogc_fid;

    const baseUrl = 'https://ugs-geoserver-prod-flbcoqv7oa-uc.a.run.app/geoserver/wfs'
    const params = new URLSearchParams({
        SERVICE: 'WFS',
        REQUEST: 'GetFeature',
        VERSION: '2.0.0',
        TYPENAMES: `${namespace}:${layerName}`, // Extract typename from featureId
        OUTPUTFORMAT: 'application/json',
        SRSNAME: 'EPSG:26912',
    })
    // in order to differentiate between normal layer and a view based layer
    // we need to check if the feature has ogc_fid property
    if (feature.properties?.ogc_fid) { // view based layer
        params.append('CQL_FILTER', `ogc_fid=${ogcFid}`);
    } else { // normal layer
        params.append('FEATUREID', featureId);
    }

    const url = `${baseUrl}?${params.toString()}`

    const response = await fetch(url)
    if (!response.ok) {
        throw new Error(`Failed to fetch WFS feature: ${response.status}`)
    }

    return response.json()
}

// Define coordinate systems
proj4.defs("EPSG:26912", "+proj=utm +zone=12 +ellps=GRS80 +datum=NAD83 +units=m +no_defs");
proj4.defs("EPSG:4326", "+proj=longlat +datum=WGS84 +no_defs");

export const convertCoordinate = (point: number[], sourceEPSG: string = "EPSG:26912", targetEPSG: string = "EPSG:4326"): number[] => {
    try {
        const converted = proj4(
            sourceEPSG,
            targetEPSG,
            point
        );

        return converted;
    } catch (error) {
        console.error('Coordinate conversion error:', error);
        return point; // fallback to original point
    }
};

export const convertBbox = (bbox: number[], sourceEPSG: string = "EPSG:26912", targetEPSG: string = "EPSG:4326"): number[] => {
    try {
        // Convert each corner of the bbox
        const minXConverted = convertCoordinate([bbox[0], bbox[1]], sourceEPSG, targetEPSG);
        const maxXConverted = convertCoordinate([bbox[2], bbox[3]], sourceEPSG, targetEPSG);

        // Return in [minX, minY, maxX, maxY] format for target coordinate system
        return [
            minXConverted[0],
            minXConverted[1],
            maxXConverted[0],
            maxXConverted[1]
        ];
    } catch (error) {
        console.error('Bbox conversion error:', error);
        return bbox; // fallback to original bbox
    }
};

export const convertCoordinates = (coordinates: number[][][]): number[][] => {
    return coordinates.flatMap(linestring =>
        linestring.map(point => {
            try {
                // Explicitly convert with more verbose proj4 definition
                const converted = proj4(
                    "+proj=utm +zone=12 +ellps=GRS80 +datum=NAD83 +units=m +no_defs",
                    "+proj=longlat +datum=WGS84 +no_defs",
                    point
                );

                return converted;
            } catch (error) {
                console.error('Conversion error:', error);
                return point; // fallback
            }
        })
    );
};

export const extractCoordinates = (geometry: Geometry): number[][][] => {
    switch (geometry.type) {
        case 'Point':
            return [[geometry.coordinates as number[]]];
        case 'LineString':
            return [geometry.coordinates as number[][]];
        case 'MultiLineString':
            return geometry.coordinates as number[][][];
        case 'Polygon':
            return geometry.coordinates;
        case 'MultiPolygon':
            return geometry.coordinates.flatMap(polygon => polygon);
        default:
            console.warn('Unsupported geometry type', geometry.type);
            return [];
    }
};

export const clearGraphics = (view: __esri.MapView | __esri.SceneView) => {
    view.graphics.removeAll();
}

export interface HighlightOptions {
    fillColor?: [number, number, number, number];
    outlineColor?: [number, number, number, number];
    outlineWidth?: number;
    pointSize?: number;
}
const defaultSearchResultHighlightOptions: HighlightOptions = {
    fillColor: [255, 255, 0, 1],
    outlineColor: [255, 255, 0, 1],
    outlineWidth: 4,
    pointSize: 5
}

export const createHighlightGraphic = (
    feature: Feature<Geometry, GeoJsonProperties>,
    options: HighlightOptions = {}
): Graphic[] => {
    const mergedOptions = { ...defaultSearchResultHighlightOptions, ...options };
    const coordinates = extractCoordinates(feature.geometry);
    const convertedCoordinates = convertCoordinates(coordinates);
    const graphics: Graphic[] = [];

    switch (feature.geometry.type) {
        case 'Point':
            const pointSymbol = new SimpleMarkerSymbol({
                color: mergedOptions.fillColor,
                size: mergedOptions.pointSize,
                outline: {
                    color: mergedOptions.outlineColor,
                    width: mergedOptions.outlineWidth
                }
            });

            graphics.push(new Graphic({
                geometry: new Point({
                    x: convertedCoordinates[0][0],
                    y: convertedCoordinates[0][1],
                    spatialReference: { wkid: 4326 }
                }),
                symbol: pointSymbol
            }));
            break;

        case 'LineString':
        case 'MultiLineString':
            coordinates.forEach(lineSegment => {
                const convertedSegment = convertCoordinates([lineSegment]);

                const polylineSymbol = new SimpleLineSymbol({
                    color: mergedOptions.outlineColor,
                    width: mergedOptions.outlineWidth
                });

                graphics.push(new Graphic({
                    geometry: new Polyline({
                        paths: [convertedSegment],
                        spatialReference: { wkid: 4326 }
                    }),
                    symbol: polylineSymbol
                }));
            });
            break;

        case 'Polygon':
        case 'MultiPolygon':
            coordinates.forEach(polygonRing => {
                const convertedRing = convertCoordinates([polygonRing]);
                const polygonSymbol = new SimpleFillSymbol({
                    color: mergedOptions.fillColor,
                    outline: {
                        color: mergedOptions.outlineColor,
                        width: mergedOptions.outlineWidth
                    }
                });

                graphics.push(new Graphic({
                    geometry: new Polygon({
                        rings: [convertedRing],
                        spatialReference: { wkid: 4326 }
                    }),
                    symbol: polygonSymbol
                }));
            });
            break;
    }

    return graphics;
};

export const highlightFeature = async (
    feature: ExtendedFeature,
    view: __esri.MapView | __esri.SceneView,
    options?: HighlightOptions
) => {
    // If the feature requires WFS geometry fetching
    let targetFeature: Feature<Geometry, GeoJsonProperties>;
    if ('namespace' in feature) {
        const wfsGeometry = await fetchWfsGeometry({
            namespace: feature.namespace,
            feature: feature
        });
        targetFeature = wfsGeometry.features[0];
    } else {
        targetFeature = feature;
    }

    // Clear previous highlights
    view.graphics.removeAll();

    // Create and add new highlight graphics with default or provided options
    // click highlight defaults to yellow
    const defaultHighlightOptions: HighlightOptions = {
        fillColor: [0, 0, 0, 0],
        outlineColor: [255, 255, 0, 1],
        outlineWidth: 4,
        pointSize: 12
    }

    const highlightOptions = { ...defaultHighlightOptions, ...options };
    const graphics = createHighlightGraphic(targetFeature, highlightOptions);
    graphics.forEach(graphic => view.graphics.add(graphic));

    // Return the converted coordinates if needed
    const coordinates = extractCoordinates(targetFeature.geometry);
    return convertCoordinates(coordinates);
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