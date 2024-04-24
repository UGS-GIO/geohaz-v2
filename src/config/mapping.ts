import SceneView from '@arcgis/core/views/SceneView'
import MapView from '@arcgis/core/views/MapView'
import Map from '@arcgis/core/Map'
import layers from '../config/layers'
import { MapApp, MapImageLayerRenderer, MapImageLayerType, RegularLayerRenderer } from './types/mappingTypes'
import { addLayersToMap, createMap, createView, setPopupAlignment } from './util/mappingUtils'
import Color from '@arcgis/core/Color'

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
    let renderers: RegularLayerRenderer[] = [];
    let mapImageRenderers: MapImageLayerRenderer[] = [];

    await view.when();

    for (let index = 0; index < map.layers.length; index++) {
        let layer = map.layers.getItemAt(index);

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

export function init(container: HTMLDivElement, initialView: 'map' | 'scene'): SceneView | MapView {
    // // Destroy the view if it exists
    // if (app.view) {
    //     app.view.destroy()
    // }

    // Create a new map and view
    // const map = createMap()
    const map = new Map({
        basemap: 'topo-vector',
    });

    // console.log('map', map);

    // Create the view
    // const view = createView(container, map, initialView)
    const view = new MapView({
        container: container,
        map: map,
        zoom: 8,
        center: [-112, 39.5],
        highlightOptions: {
            color: new Color([255, 255, 0, 1]),
            haloColor: new Color("white"),
            haloOpacity: 0.9,
            fillOpacity: 0.2
        }
    });

    console.log("height and width", view.heightBreakpoint, view.widthBreakpoint, view.width, view.height, view.ready)

    // console.log('view', view);

    // const { heightBreakpoint, widthBreakpoint } = view;
    // const { height, width, ready } = view;

    // console.log('height, width', heightBreakpoint, widthBreakpoint, width, height, ready);
    // console.log("heigt wiedth another way", view.heightBreakpoint, view.widthBreakpoint, view.width, view.height, view.ready)


    // Add layers to the map
    addLayersToMap(map, layers)

    // prevent collision with the edges of the view
    setPopupAlignment(view);
    // track pointer movements
    // pointerMoveHandlers(view);
    // // expand widget handler
    // expandClickHandlers(view);

    return view
}