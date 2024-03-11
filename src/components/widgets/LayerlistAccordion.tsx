import React, { useContext, useEffect, useState } from 'react';
import { CalciteBlock, CalciteLabel, CalciteSlider, CalciteSwitch, CalciteAccordion, CalciteAccordionItem } from '@esri/calcite-components-react';
import { CalciteSliderCustomEvent } from "@esri/calcite-components";
import { MapContext } from '../../contexts/MapProvider';
import * as symbolUtils from "@arcgis/core/symbols/support/symbolUtils.js";
import { useQuery } from '@tanstack/react-query';
import { MapImageLayerRenderer, RegularLayerRenderer } from '../../config/types/mappingTypes';

interface LayerAccordionProps {
    layer: __esri.ListItem
}

const findLayerById = (layers: __esri.Collection<__esri.ListItem>, id: string) => {
    const flatLayers = layers.flatten(layer => layer.children || []);
    return flatLayers.find(layer => String(layer.layer.id) === String(id));
};

const LayerAccordion: React.FC<LayerAccordionProps> = ({ layer }) => {
    const { activeLayers, getRenderer } = useContext(MapContext);
    const [currentLayer, setCurrentLayer] = useState<__esri.ListItem>();
    const [layerVisibility, setLayerVisibility] = useState<boolean | undefined>();
    const [layerOpacity, setLayerOpacity] = useState<number>(1);
    const [preview, setPreview] = useState<{ html: HTMLElement, label: string }[]>();

    const layerId = layer.layer.id;
    const layerTitle = layer.layer.title;

    const { data: legendData } = useQuery(
        {
            queryKey: ['legendHTML', layer.layer],
            queryFn: () => getRenderer ? getRenderer(layerId) : Promise.resolve(undefined),
        }
    );

    useEffect(() => {
        const generatePreview = async (rendererData: MapImageLayerRenderer | RegularLayerRenderer) => {
            let html: HTMLElement | null = null;
            const label = rendererData.label;

            if ('renderer' in rendererData) {
                html = await symbolUtils.renderPreviewHTML(rendererData.renderer);
            } else if ('imageData' in rendererData) {
                const imgHTML = `<img src="data:image/png;base64,${rendererData.imageData}" alt="${label}" />`;
                const range = document.createRange();
                const fragment = range.createContextualFragment(imgHTML);
                html = fragment.firstChild as HTMLElement;
            }

            if (html) {
                return { html, label };
            }

            return null;
        };

        const generateAllPreviews = async () => {
            if (legendData) {
                const allRenderers = [...legendData.MapImageLayerRenderer, ...legendData.RegularLayerRenderer];
                const previews = await Promise.all(allRenderers.map(rendererData => generatePreview(rendererData)));
                const filteredPreviews = previews.filter(Boolean) as { html: HTMLElement; label: string }[];
                setPreview(filteredPreviews);
            }
        };

        generateAllPreviews();
    }, [legendData]);


    useEffect(() => {
        if (activeLayers && layerId) {
            const foundLayer = findLayerById(activeLayers, layerId);
            setCurrentLayer(foundLayer);
            setLayerVisibility(foundLayer?.visible);
            setLayerOpacity(foundLayer?.layer.opacity || 1);
        }
    }, [activeLayers, layerId]);

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
        <CalciteBlock heading={`${layerTitle}`} collapsible >
            <CalciteAccordion>
                <CalciteAccordionItem heading={`${layerTitle} Legend`} >
                    {preview && preview.map((preview, index) => {
                        return (
                            <div key={index} className='flex items-end space-x-4 py-1'>
                                <span dangerouslySetInnerHTML={{ __html: preview.html.outerHTML || '' }} />
                                <span>{preview.label}</span>
                            </div>
                        )
                    })}
                </CalciteAccordionItem>
                <CalciteAccordionItem heading={`${layerTitle} Controls`}>
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