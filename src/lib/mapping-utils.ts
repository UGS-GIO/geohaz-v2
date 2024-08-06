import SceneView from '@arcgis/core/views/SceneView'
import MapView from '@arcgis/core/views/MapView'
import layers from '@/data/layers'
import { GetResultsHandlerType, LayerConstructor, MapApp, MapImageLayerRenderer, MapImageLayerType, RegularLayerRenderer } from '@/lib/types/mapping-types'
import * as reactiveUtils from "@arcgis/core/core/reactiveUtils";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import GroupLayer from "@arcgis/core/layers/GroupLayer";
import MapImageLayer from "@arcgis/core/layers/MapImageLayer";
import TileLayer from "@arcgis/core/layers/TileLayer";
import Map from '@arcgis/core/Map'
import { LayerProps, layerTypeMapping } from "@/lib/types/mapping-types";
import * as promiseUtils from "@arcgis/core/core/promiseUtils.js";
import Color from "@arcgis/core/Color";
import BasemapGallery from "@arcgis/core/widgets/BasemapGallery";
import Expand from "@arcgis/core/widgets/Expand";
import Popup from "@arcgis/core/widgets/Popup";
import GeoJSONLayer from "@arcgis/core/layers/GeoJSONLayer";
import Graphic from "@arcgis/core/Graphic.js";
import Polyline from "@arcgis/core/geometry/Polyline.js";
import SpatialReference from "@arcgis/core/geometry/SpatialReference.js";
import { Feature, FeatureCollection } from 'geojson';


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

    for (let index = 0; index < map.layers.length; index++) {
        const layer = map.layers.getItemAt(index);

        if (layer.type === 'group') {
            await handleGroupLayer(layer as __esri.GroupLayer, renderers, mapImageRenderers);
        } else if (layer.type === 'map-image') {
            await handleMapImageLayer(layer as __esri.MapImageLayer, mapImageRenderers);
        } else if (layer.type === 'feature') {
            await handleFeatureLayer(layer as __esri.FeatureLayer, renderers);
        } else {
            console.error('Layertype not supported, please add it to the getRenderers function', layer.type);
        }
    }

    return { renderers, mapImageRenderers };
};

const handleGroupLayer = async (layer: __esri.GroupLayer, renderers: RegularLayerRenderer[], mapImageRenderers: MapImageLayerRenderer[]) => {
    layer.allLayers.forEach(async (sublayer) => {
        if (sublayer.type === 'feature') {
            handleFeatureLayer(sublayer as __esri.FeatureLayer, renderers);
        } else if (sublayer.type === 'map-image') {
            handleMapImageLayer(sublayer as __esri.MapImageLayer, mapImageRenderers);
        } else {
            console.error('grouplayer type not supported, please add it to the getRenderers function', sublayer.type);
        }
    });
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

export const findLayerById = (layers: __esri.Collection<__esri.ListItem>, id: string) => { const flatLayers = layers.flatten(layer => layer.children || []); return flatLayers.find(layer => String(layer.layer.id) === String(id)); };

export function init(container: HTMLDivElement, isMobile: boolean, initialView?: 'map' | 'scene'): SceneView | MapView {
    // // Destroy the view if it exists
    if (app.view) {
        app.view.destroy()
    }

    // Create a new map and view
    const map = createMap()

    // Create the view
    const view = createView(container, map, initialView, isMobile)

    // Add layers to the map
    addLayersToMap(map, layers)

    // prevent collision with the edges of the view
    setPopupAlignment(view);

    // // expand widget handler
    expandClickHandlers(view);

    return view
}



// Create a new map
export const createMap = () => {
    const map = new Map({
        basemap: 'topo-vector',
    });
    return map;
}

// Create a new view
export const createView = (container: HTMLDivElement, map: Map, viewType: 'map' | 'scene' = 'scene', isMobile: boolean) => {

    // Common options for both MapView and SceneView
    const commonOptions = {
        container: container,
        map: map,
        zoom: 8,
        center: [-112, 39.5],
        highlightOptions: {
            color: new Color([255, 255, 0, 1]),
            haloColor: new Color("white"),
            haloOpacity: 0.9,
            fillOpacity: 0.2
        },
        ui: {
            components: ['zoom', 'compass', 'attribution',]
        },
        ...(!isMobile && {
            popup: new Popup({
                dockEnabled: true,
                dockOptions: {
                    // Disables the dock button from the popup
                    buttonEnabled: false,
                    // Ignore the default sizes that trigger responsive docking
                    breakpoint: false,
                    position: 'bottom-left',
                }
            })
        }),
    }

    return viewType === 'scene'
        ? new SceneView({ ...commonOptions })
        : new MapView({ ...commonOptions });
}

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

// Helper function to reduce code duplication in createLayer
function createLayerFromUrl(layer: LayerProps, LayerType: LayerConstructor) {
    // Create a layer based on the layer props
    if ('url' in layer && LayerType) {
        return new LayerType({
            url: layer.url,
            ...layer.options,
        });
    }

    if (layer.type === 'group') {
        if (layer.layers) {
            // Create an array of group layers by mapping the layers and filtering out any undefined elements
            const groupedLayers = layer.layers.map(createLayer).filter(layer => layer !== undefined) as (FeatureLayer | TileLayer | GroupLayer | MapImageLayer | GeoJSONLayer)[];
            return groupedLayers;
        }
    }

    console.warn(`Missing URL in layer props: ${JSON.stringify(layer)}`);
    return undefined;

}

// Create a layer based on the layer props
export const createLayer = (layer: LayerProps) => {
    // Handle the special case for group layers
    if (layer.type === 'group' && layer.layers) {
        const groupLayers = layer.layers.map(createLayer).filter(layer => layer !== undefined) as __esri.CollectionProperties<__esri.LayerProperties> | undefined;
        return new GroupLayer({
            title: layer.title,
            visible: layer.visible,
            layers: groupLayers,
        });
    }

    // Get the LayerType from the mapping
    const LayerType = layerTypeMapping[layer.type];

    // If the LayerType exists, create a new layer
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
    console.log(params);

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
        console.log(item);

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