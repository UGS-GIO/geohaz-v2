import SceneView from '@arcgis/core/views/SceneView'
import MapView from '@arcgis/core/views/MapView'
import layers from '@/data/layers'
import { GetResultsHandlerType, GroupLayerProps, LayerConstructor, MapApp, MapImageLayerRenderer, MapImageLayerType, RegularLayerRenderer, WMSLayerProps } from '@/lib/types/mapping-types'
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
import { Feature, FeatureCollection } from 'geojson';
import { createEsriSymbol } from '@/lib/legend/symbol-generator';
import { LegendProps, LegendRule } from '@/lib/types/geoserver-types';
import PictureMarkerSymbol from "@arcgis/core/symbols/PictureMarkerSymbol.js";
import Point from "@arcgis/core/geometry/Point.js";
import { MAP_PIN_ICON } from '@/assets/icons';

// Create a global app object to store the view
const app: MapApp = {}

function handleRendererType(layer: __esri.FeatureLayer | __esri.Sublayer, renderers: { renderer: __esri.Symbol, id: string | number, label: string, url: string }[]) {
    if (layer.renderer.type === 'unique-value') {
        const renderer = layer.renderer as __esri.UniqueValueRenderer;
        const uniqueValueInfosRenderers = renderer.uniqueValueInfos.map((info) => {
            return {
                renderer: info.symbol,
                id: layer.id,
                label: info.label,
                url: layer.url,
                title: layer.title
            }
        });
        renderers.push(...uniqueValueInfosRenderers);
    } else if (layer.renderer.type === 'simple') {
        const renderer = layer.renderer as __esri.SimpleRenderer;
        renderers.push({
            renderer: renderer.symbol,
            id: layer.id,
            label: layer.title,
            url: layer.url
        });
    } else {
        console.log('developer, you need to handle this new type of renderer');
    }
}

function handleMapImageLayerRendererType(layerArr: MapImageLayerType, renderers: MapImageLayerRenderer[], url: string) {
    layerArr.layers.forEach((layer, index) => {
        layer.legend.forEach((legendELement) => {
            renderers.push({
                label: legendELement.label,
                imageData: legendELement.imageData,
                id: index.toString(),
                url: url,
                title: layer.layerName
            })
        });
    })

}

export const getRenderers = async function (view: SceneView | MapView, map: __esri.Map) {
    const renderers: RegularLayerRenderer[] = [];
    const mapImageRenderers: MapImageLayerRenderer[] = [];

    await view.when();

    const handleRenders = async (map: __esri.Map) => {
        for (let index = 0; index < map.layers.length; index++) {
            const layer = map.layers.getItemAt(index);

            switch (layer.type) {
                case 'group':
                    await handleGroupLayer(layer as __esri.GroupLayer, renderers, mapImageRenderers);
                    break;
                case 'map-image':
                    await handleMapImageLayer(layer as __esri.MapImageLayer, mapImageRenderers);
                    break;
                case 'feature':
                    await handleFeatureLayer(layer as __esri.FeatureLayer, renderers);
                    break;
                case 'wms':
                    await handleWMSLayer(layer as __esri.WMSLayer, renderers);
                    break;
                default:
                    console.error('Layer type not supported:', layer.type);
            }
        }
    }
    await handleRenders(map);

    return { renderers, mapImageRenderers };
};

const handleGroupLayer = async (
    layer: __esri.GroupLayer,
    renderers: RegularLayerRenderer[],
    mapImageRenderers: MapImageLayerRenderer[]
) => {
    for (const sublayer of layer.allLayers) {
        try {
            switch (sublayer.type) {
                case 'feature':
                    await handleFeatureLayer(sublayer as __esri.FeatureLayer, renderers);
                    break;
                case 'map-image':
                    await handleMapImageLayer(sublayer as __esri.MapImageLayer, mapImageRenderers);
                    break;
                case 'wms':
                    await handleWMSLayer(sublayer as __esri.WMSLayer, renderers);
                    break;
                default:
                    console.error('GroupLayer type not supported, please add it to the getRenderers function:', sublayer.type);
            }
        } catch (error) {
            console.error('Error processing sublayer:', sublayer.type, error);
        }
    }
};


const handleMapImageLayer = async (layer: __esri.MapImageLayer, renderers: MapImageLayerRenderer[]) => {
    // call the legend endpoint to get the legend
    const legend = await fetch(
        `${layer.url}/legend?f=pjson`
    );

    const response: MapImageLayerType = await legend.json();
    handleMapImageLayerRendererType(response, renderers, layer.url)
};

const handleFeatureLayer = async (layer: __esri.FeatureLayer, renderers: RegularLayerRenderer[]) => {
    handleRendererType(layer, renderers);
};

export const handleWMSLayer = async (
    layer: __esri.WMSLayer,
    renderers: RegularLayerRenderer[]
) => {
    const fetchPromises = layer.sublayers.map(async (sublayer) => {
        const legendUrl = `${layer.url}?&service=WMS&request=GetLegendGraphic&format=application/json&layer=${sublayer.name}`;

        try {
            const response = await fetch(legendUrl, {
                method: "GET",
                headers: {
                    Accept: "application/json",
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status} for sublayer ${sublayer.name}`);
            }

            const legendData = await response.json();

            if (legendData && legendData.Legend) {
                legendData.Legend.forEach((legend: LegendProps) => {
                    legend.rules.forEach((rule: LegendRule) => {
                        const renderer = {
                            label: rule.title,
                            renderer: createEsriSymbol(rule.symbolizers[0]),
                            id: layer.id.toString(),
                            url: layer.url,
                        };
                        renderers.push(renderer);
                    });
                });
            } else {
                console.error("Invalid legend data format for sublayer", sublayer.name);
            }
        } catch (error) {
            console.error("Error fetching legend data for sublayer", sublayer.name, ":", error);
        }
    });

    try {
        await Promise.all(fetchPromises);
    } catch (error) {
        console.error("Error in one or more fetches:", error);
    }
};

export const findLayerById = (layers: __esri.Collection<__esri.ListItem>, id: string) => { const flatLayers = layers.flatten(layer => layer.children || []); return flatLayers.find(layer => String(layer.layer.id) === String(id)); };

export function init(
    container: HTMLDivElement,
    isMobile: boolean,
    { zoom, center }: { zoom: number, center: [number, number] },
    initialView?: 'map' | 'scene'
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
        basemap: 'topo-vector',
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
    // Add layers to the map
    layers.forEach((layer: LayerProps) => {
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
            fetchFeatureInfoFunction: typedLayer.fetchFeatureInfoFunction,
        });
    }

    if (layer.url) {
        return new LayerType({
            url: layer.url,
            title: layer.title,
            visible: layer.visible,
            ...layer.options,
        });
    }

    console.warn(`Missing URL in layer props: ${JSON.stringify(layer)}`);
    return undefined;
}

export const createLayer = (layer: LayerProps) => {
    if (layer.type === 'group') {
        const typedLayer = layer as GroupLayerProps;
        const groupLayers = typedLayer.layers?.map(createLayer).filter(layer => layer !== undefined) as __esri.CollectionProperties<__esri.LayerProperties> | undefined;
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
        searchTerm = params.suggestResult.key ? params.suggestResult.key : '';
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