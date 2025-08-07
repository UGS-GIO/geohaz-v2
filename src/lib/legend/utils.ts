import UniqueValueRenderer from "@arcgis/core/renderers/UniqueValueRenderer.js";
import SimpleRenderer from "@arcgis/core/renderers/SimpleRenderer.js";
import WMSSublayer from "@arcgis/core/layers/support/WMSSublayer.js";
import { createEsriSymbol } from '@/lib/legend/symbol-generator';
import { Legend } from '@/lib/types/geoserver-types';
import { MapImageLayerType } from '@/lib/types/mapping-types'
import GroupLayer from "@arcgis/core/layers/GroupLayer";


// Fetch the renderer for a given layer ID
export const getRenderer = async function (
    view: __esri.SceneView | __esri.MapView,
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
