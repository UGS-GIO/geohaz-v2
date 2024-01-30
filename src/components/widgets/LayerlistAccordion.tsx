import React, { useContext, useEffect, useState } from 'react';
import { CalciteBlock, CalciteLabel, CalciteSlider, CalciteSwitch, CalciteAccordion, CalciteAccordionItem } from '@esri/calcite-components-react';
import { CalciteSliderCustomEvent } from "@esri/calcite-components";
import { MapContext } from '../../contexts/MapProvider';

interface LayerAccordionProps {
    layerName: string;
    symbology?: string;
    layerId?: string;
}

const findLayerById = (layers: __esri.Collection<__esri.ListItem>, id: string) => {
    const flatLayers = layers.flatten(layer => layer.children || []);
    return flatLayers.find(layer => String(layer.layer.id) === String(id));
};

const LayerAccordion: React.FC<LayerAccordionProps> = ({ layerName, symbology = "symbology goes here", layerId }) => {
    const { activeLayers } = useContext(MapContext);

    const [currentLayer, setCurrentLayer] = useState<__esri.ListItem>();
    const [layerVisibility, setLayerVisibility] = useState<boolean | undefined>();
    const [layerOpacity, setLayerOpacity] = useState<number>(1);

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
        <CalciteBlock heading={`${layerName}`} collapsible >
            <CalciteAccordion>
                <CalciteAccordionItem heading={`${layerName} Legend`}>
                    <div>{symbology}</div>
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