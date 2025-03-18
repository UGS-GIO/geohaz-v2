import SceneView from '@arcgis/core/views/SceneView'
import MapView from '@arcgis/core/views/MapView'
import { GetResultsHandlerType, GroupLayerProps, LayerConstructor, MapApp, MapImageLayerType, WMSLayerProps } from '@/lib/types/mapping-types'
import * as reactiveUtils from "@arcgis/core/core/reactiveUtils";
import GroupLayer from "@arcgis/core/layers/GroupLayer";
import Map from '@arcgis/core/Map'
import { LayerProps, layerTypeMapping } from "@/lib/types/mapping-types";
import * as promiseUtils from "@arcgis/core/core/promiseUtils.js";
import Color from "@arcgis/core/Color";
import BasemapGallery from "@arcgis/core/widgets/BasemapGallery";
import Expand from "@arcgis/core/widgets/Expand";
import Popup from "@arcgis/core/widgets/Popup";
import Graphic from "@arcgis/core/Graphic.js";
import Polyline from "@arcgis/core/geometry/Polyline.js";
import SpatialReference from "@arcgis/core/geometry/SpatialReference.js";
import { Feature, FeatureCollection, GeoJsonProperties, Geometry } from 'geojson';
import { createEsriSymbol } from '@/lib/legend/symbol-generator';
import { Legend } from '@/lib/types/geoserver-types';
import PictureMarkerSymbol from "@arcgis/core/symbols/PictureMarkerSymbol.js";
import Point from "@arcgis/core/geometry/Point.js";
import { MAP_PIN_ICON } from '@/assets/icons';
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

    const firstLegendElement = legend.layers[0]?.legend[0];
    if (firstLegendElement) {
        return {
            label: firstLegendElement.label,
            imageData: firstLegendElement.imageData,
            id: '0',
            url: layer.url,
            title: legend.layers[0].layerName,
        };
    }

    console.error('No legend data found for MapImageLayer.');
    return;
};

const getFeatureLayerRenderer = async (layer: __esri.FeatureLayer) => {
    if (layer.renderer?.type === 'unique-value') {
        const renderer = new UniqueValueRenderer(layer.renderer);
        return renderer.uniqueValueInfos?.map(info => ({
            renderer: info.symbol,
            id: layer.id,
            label: info.label,
            url: layer.url,
        }));
    } else if (layer.renderer?.type === 'simple') {
        const renderer = new SimpleRenderer(layer.renderer);
        return [{
            renderer: renderer.symbol,
            id: layer.id,
            label: layer.title,
            url: layer.url,
        }];
    } else {
        console.error('Unsupported renderer type for FeatureLayer.');
        return [new SimpleRenderer];
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

export function init(
    container: HTMLDivElement,
    isMobile: boolean,
    { zoom, center }: { zoom: number, center: [number, number] },
    layers: LayerProps[],
    initialView?: 'map' | 'scene',
): SceneView | MapView {
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

    // Expand widget handler
    expandClickHandlers(view);

    return view;
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
        highlightOptions: {
            color: new Color([255, 255, 0, 1]),
            haloColor: new Color("white"),
            haloOpacity: 0.9,
            fillOpacity: 0.2,
        },
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

export interface LayerOrderConfig {
    layerName: string;
    position: "start" | "end" | number;
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


// Function to fetch suggestions from the search box
export const fetchQFaultSuggestions = async (params: { suggestTerm: string, sourceIndex: number }, url: string): Promise<__esri.SuggestResult[]> => {
    const response = await fetch(`${url}?search_term=${encodeURIComponent(params.suggestTerm)}`);
    const data: FeatureCollection = await response.json();

    return data.features.map((item: Feature) => {
        return {
            text: '<p>' + item.properties?.concatnames + '</p>',
            key: item.properties?.concatnames,
            sourceIndex: params.sourceIndex,
        };
    });
};

// Function to fetch results from the search box
export const fetchQFaultResults = async (params: GetResultsHandlerType, url: string): Promise<__esri.SearchResult[]> => {
    let searchUrl = url;
    let searchTerm = '';

    // If the sourceIndex is not null, then the user selected a suggestion from the search box
    // If the sourceIndex is null, then the user pressed enter in the search box or hit the search button (a non specific search)
    if (params.suggestResult.sourceIndex !== null) {
        searchTerm = params.suggestResult.key?.toString() ? params.suggestResult.key.toString() : '';
        searchUrl += `?search_key=${encodeURIComponent(searchTerm)}`;
    } else {
        searchTerm = params.suggestResult.text ? params.suggestResult.text : '';
        searchUrl += `?search_term=${encodeURIComponent(searchTerm)}`;
    }

    const response = await fetch(searchUrl);
    const data = await response.json();

    if (data.features.length === 0) {
        return [];
    }

    // Create graphics for each feature returned from the search
    const graphics: __esri.Graphic[] = data.features.map((item: GeoJSON.Feature) => {
        const typedGeometry = item.geometry as GeoJSON.MultiPoint;
        const coordinates = typedGeometry.coordinates as unknown as number[][][]

        const polyline = new Polyline({
            paths: coordinates,
            spatialReference: new SpatialReference({
                wkid: 4326
            }),
        });

        return new Graphic({
            geometry: polyline,
            attributes: item.properties
        });
    });

    // Create a merged polyline to add the polyline paths to
    const mergedPolyline = new Polyline({
        spatialReference: new SpatialReference({ wkid: 4326 })
    });

    // Add the paths from each graphic to the merged polyline
    graphics.forEach((graphic: __esri.Graphic) => {
        const polyline = graphic.geometry as Polyline;
        const paths = polyline.paths;
        paths.forEach(path => {
            mergedPolyline.addPath(path);
        });
    });

    // Create attributes for the target graphic
    const attributes = params.sourceIndex !== null
        ? { name: data.features[0].properties.concatnames }
        : { name: `Search results for: ${searchTerm}` };

    // Create a target graphic to return
    const target = new Graphic({
        geometry: mergedPolyline,
        attributes: attributes
    });

    return [{
        extent: mergedPolyline.extent,
        name: target.attributes.name,
        feature: target,
        target: target
    }];
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

// Create a graphic to display a point on the map
export function createGraphic(lat: number, long: number, view: SceneView | MapView) {
    // Create a symbol for drawing the point
    const markerSymbol = new PictureMarkerSymbol({
        url: `${MAP_PIN_ICON}`,
        width: "20px",
        height: "20px",
        yoffset: 10
    });
    // Create a graphic and add the geometry and symbol to it
    const pointGraphic = new Graphic({
        geometry: new Point({
            longitude: long,
            latitude: lat
        }),
        symbol: markerSymbol
    });

    // Add the graphics to the view's graphics layer
    view.graphics.add(pointGraphic);
}

// Remove all graphics from the view
export function removeGraphics(view: SceneView | MapView) {
    view.graphics.removeAll();
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
    featureCount = 50
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

interface HighlightOptions {
    fillColor?: [number, number, number, number];
    outlineColor?: [number, number, number, number];
    outlineWidth?: number;
    pointSize?: number;
}

const defaultHighlightOptions: HighlightOptions = {
    fillColor: [0, 0, 0, 0], // Transparent fill
    outlineColor: [255, 255, 0, 1],
    outlineWidth: 2,
    pointSize: 12
};

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

export const extractCoordinates = (feature: Feature<Geometry, GeoJsonProperties>): number[][][] => {
    switch (feature.geometry.type) {
        case 'Point':
            return [[feature.geometry.coordinates as number[]]];
        case 'LineString':
            return [feature.geometry.coordinates as number[][]];
        case 'MultiLineString':
            return feature.geometry.coordinates as number[][][];
        case 'Polygon':
            return feature.geometry.coordinates;
        case 'MultiPolygon':
            return feature.geometry.coordinates.flatMap(polygon => polygon);
        default:
            console.warn('Unsupported geometry type');
            return [];
    }
};

export const createHighlightGraphic = (
    feature: Feature<Geometry, GeoJsonProperties>,
    options: HighlightOptions = {}
): Graphic[] => {
    const mergedOptions = { ...defaultHighlightOptions, ...options };
    const coordinates = extractCoordinates(feature);
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

export const clearGraphics = (view: __esri.MapView | __esri.SceneView) => {
    view.graphics.removeAll();
}

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
        targetFeature = feature as Feature<Geometry, GeoJsonProperties>;
    }

    // Clear previous highlights
    view.graphics.removeAll();

    // Create and add new highlight graphics with default or provided options
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
    const coordinates = extractCoordinates(targetFeature);
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