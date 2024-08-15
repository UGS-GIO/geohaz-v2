import { useContext, useEffect, useState } from 'react';
import LayerControls from '@/components/custom/layer-controls';
import { Accordion, AccordionContent, AccordionHeader, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { MapContext } from '@/context/map-provider';
import { findLayerById } from '@/lib/mapping-utils';
import { LegendAccordion } from './legend-accordion';

interface LayerAccordionProps {
    layer: __esri.ListItem;
    isTopLevel: boolean;
}

const LayerAccordion = ({ layer, isTopLevel }: LayerAccordionProps) => {
    const { id: layerId, title: layerTitle } = layer.layer;
    const { view, activeLayers, layerDescriptions } = useContext(MapContext);
    const [currentLayer, setCurrentLayer] = useState<__esri.ListItem>();
    const [layerVisibility, setLayerVisibility] = useState<boolean>(layer.layer.visible);
    const [layerOpacity, setLayerOpacity] = useState<number>(layer.layer.opacity || 1);
    const typeNarrowedLayer = layer.layer as __esri.FeatureLayer | __esri.MapImageLayer | __esri.WMSLayer;

    useEffect(() => {
        if (activeLayers && layerId) {
            const foundLayer = findLayerById(activeLayers, layerId);
            if (foundLayer) {
                setCurrentLayer(foundLayer);
                setLayerVisibility(foundLayer.visible);
                setLayerOpacity(foundLayer.layer.opacity || 1);
            }
        }
    }, [activeLayers, layerId]);

    const updateLayer = (updateFn: (layer: __esri.Layer) => void) => {
        if (currentLayer) {
            updateFn(currentLayer.layer);
            setLayerVisibility(currentLayer.layer.visible);
            setLayerOpacity(currentLayer.layer.opacity || 1);
        }
    };

    const handleVisibilityToggle = () => updateLayer(layer => {
        layer.visible = !layer.visible;
    });

    const handleOpacityChange = (value: number) => updateLayer(layer => {
        layer.opacity = value / 100;
    });

    const handleZoomToLayer = () => {
        if (currentLayer && currentLayer.layer.fullExtent) {
            view?.goTo(currentLayer.layer.fullExtent);
        }
    };

    return (
        <div key={layerId}>
            <Accordion type="single" collapsible>
                <AccordionItem value="item-1">
                    <AccordionHeader>
                        <Checkbox
                            checked={layerVisibility}
                            onClick={handleVisibilityToggle}
                            className="mx-2"
                        />
                        <AccordionTrigger>
                            <h3 className={`text-md font-medium text-left ${isTopLevel ? 'text-lg' : ''}`}>{layerTitle}</h3>
                        </AccordionTrigger>
                    </AccordionHeader>
                    <AccordionContent>
                        <div className="flex flex-col space-y-4 mx-8">
                            <LayerControls
                                layerOpacity={layerOpacity}
                                handleOpacityChange={handleOpacityChange}
                                title={layerTitle}
                                description={layerDescriptions ? layerDescriptions[layerTitle] : ''}
                                handleZoomToLayer={handleZoomToLayer}
                            />
                            <LegendAccordion layerId={layerId} url={typeNarrowedLayer.url} />
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    );
};

export { LayerAccordion };
