import React, { useContext, useEffect, useState } from 'react';
import { CalciteBlock, CalciteLabel, CalciteSlider, CalciteSwitch, CalciteAccordion, CalciteAccordionItem } from '@esri/calcite-components-react';
import { CalciteSliderCustomEvent } from "@esri/calcite-components";
import { MapContext } from '../../contexts/MapProvider';
import useCustomLegend from '../../hooks/useCustomLegend';
import * as symbolUtils from "@arcgis/core/symbols/support/symbolUtils.js";
import { useQuery } from '@tanstack/react-query';

interface LayerAccordionProps {
    layerName: string;
    layerId: string;
}

const findLayerById = (layers: __esri.Collection<__esri.ListItem>, id: string) => {
    const flatLayers = layers.flatten(layer => layer.children || []);
    return flatLayers.find(layer => String(layer.layer.id) === String(id));
};

const LayerAccordion: React.FC<LayerAccordionProps> = ({ layerName, layerId }) => {
    const { activeLayers } = useContext(MapContext);

    const [currentLayer, setCurrentLayer] = useState<__esri.ListItem>();
    const [layerVisibility, setLayerVisibility] = useState<boolean | undefined>();
    const [layerOpacity, setLayerOpacity] = useState<number>(1);
    const [legendHTML, setLegendHTML] = useState<{ [key: string]: HTMLElement }>({});

    const { legendElements: legendItem } = useCustomLegend({ layerId });


    useEffect(() => {
        if (activeLayers && layerId) {
            const foundLayer = findLayerById(activeLayers, layerId);
            setCurrentLayer(foundLayer);
            setLayerVisibility(foundLayer?.visible);
            setLayerOpacity(foundLayer?.layer.opacity || 1);
        }
    }, [activeLayers, layerId]);

    const fetchLegendHTML = async (legendItem: any, layerId: string) => {
        const newLegendHTML: { [key: string]: string[] } = {}; // Change to string array

        console.log('LEGEND ITEM', legendItem);


        for (const item of legendItem) {
            for (const info of item.infos || []) {
                console.log(`Symbol for layerId ${layerId}:`, info.symbol);

                const html = await symbolUtils.renderPreviewHTML(info.symbol);
                if (newLegendHTML[layerId]) {
                    newLegendHTML[layerId].push(html.outerHTML); // Push to array
                } else {
                    newLegendHTML[layerId] = [html.outerHTML]; // Initialize array
                }
            }
        }

        // Convert arrays to strings
        const result: { [key: string]: string } = {};
        for (const key in newLegendHTML) {
            result[key] = newLegendHTML[key].join('');
        }

        return result;
    };

    const { data: legendData } = useQuery(
        {
            queryKey: ['legendHTML', layerId],
            queryFn: () => fetchLegendHTML(legendItem, layerId),
            enabled: !!legendItem,
            initialData: {},
        });

    const updateLayer = (updateFn: (layer: __esri.Layer) => void) => {
        if (currentLayer) {
            updateFn(currentLayer.layer);
        }
    };

    const handleVisibilityToggle = () => updateLayer(layer => {
        layer.visible = !layer.visible;
        setLayerVisibility(layer.visible ? layer.visible : undefined);
    });

    const handleOpacityChange = (event: CalciteSliderCustomEvent<void>) => updateLayer(layer => {
        layer.opacity = Number(event.target.value) / 100;
        setLayerOpacity(layer.opacity);
    });

    return (
        <CalciteBlock heading={`${layerName}`} collapsible >
            <CalciteAccordion>
                <CalciteAccordionItem heading={`${layerName} Legend`}>
                    <div dangerouslySetInnerHTML={{ __html: legendData[layerId] || '' }} />
                </CalciteAccordionItem>
                <CalciteAccordionItem heading={`${layerName} Controls`}>
                    <CalciteLabel layout="inline">
                        Visibility
                        <CalciteSwitch onCalciteSwitchChange={handleVisibilityToggle} checked={layerVisibility} />
                    </CalciteLabel>
                    <CalciteLabel>
                        Opacity
                        <CalciteSlider onCalciteSliderChange={(e) => handleOpacityChange(e)} value={layerOpacity * 100} />
                    </CalciteLabel>
                </CalciteAccordionItem>
            </CalciteAccordion>
        </CalciteBlock >
    );
};

export default LayerAccordion;