import UniqueValueRenderer from "@arcgis/core/renderers/UniqueValueRenderer.js";
import SimpleRenderer from "@arcgis/core/renderers/SimpleRenderer.js";
import WMSSublayer from "@arcgis/core/layers/support/WMSSublayer.js";
import { createSVGSymbol } from '@/lib/legend/symbol-generator';
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


        /* 
        * Function to determine if a rule is an auto-generated default symbolizer
        * This checks if the rule has a single Point symbolizer with no fill/stroke in graphics
        * indicating it is an auto-generated default symbolizer (text-only rule). 
        * */
        const isAutoGeneratedDefaultSymbolizer = (rule: any) => {
            // Check if this is an auto-generated default symbolizer (text-only rule)
            // Key indicators: single Point symbolizer with no fill/stroke in graphics            
            const pointSymbolizer = rule.symbolizers?.[0]?.Point;
            return rule.symbolizers?.length === 1 &&
                pointSymbolizer &&
                pointSymbolizer.graphics?.length === 1 &&
                pointSymbolizer.graphics[0].mark &&
                !pointSymbolizer.graphics[0].fill &&
                !pointSymbolizer.graphics[0].stroke;
        }

        // Map through all the rules and generate preview objects for each rule
        const previews = rules.map((rule) => {

            const isAutoGeneratedDefault = isAutoGeneratedDefaultSymbolizer(rule);
            const label = rule.title || rule.name || 'Default Symbolizer'; // Use title or name as label

            if (isAutoGeneratedDefault) {
                // Create an empty/invisible SVG for auto-generated default symbolizers
                const emptySvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                emptySvg.setAttribute("width", "32");
                emptySvg.setAttribute("height", "20");
                emptySvg.setAttribute("viewBox", "0 0 32 20");
                emptySvg.style.display = "block";
                emptySvg.style.visibility = "hidden"; // Make it invisible

                return {
                    type: 'regular-layer-renderer',
                    label: label, // Use the rule name/title as text
                    renderer: emptySvg,
                    id: layer.id.toString(),
                    url: layer.url,
                };
            }

            // For all other rules, create the SVG symbol normally
            return {
                type: 'regular-layer-renderer',
                label: label,
                renderer: createSVGSymbol(rule.symbolizers),
                id: layer.id.toString(),
                url: layer.url,
            };
        });

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
