import { useContext, useEffect, useState } from 'react';
import useLegendPreview from '@/hooks/use-legend-preview';
import LayerControls from '@/components/custom/layer-controls';
import { Accordion, AccordionContent, AccordionHeader, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { MapContext } from '@/context/map-provider';
import { findLayerById } from '@/lib/mapping-utils';
// import { RendererProps } from '@/lib/types/mapping-types';
import { ChevronDownIcon } from 'lucide-react';

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
    const typeNarrowedLayer = layer.layer as __esri.FeatureLayer | __esri.TileLayer | __esri.MapImageLayer | __esri.ImageryLayer | __esri.WMSLayer;

    // Fallback for getRenderer if it can be undefined
    // const defaultGetRenderer = async () => undefined;

    const { preview, isLoading, error } = useLegendPreview(layerId, typeNarrowedLayer.url);

    console.log('preview', preview);


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
                        <LayerControls
                            layerOpacity={layerOpacity}
                            handleOpacityChange={handleOpacityChange}
                            title={layerTitle}
                            description={layerDescriptions ? layerDescriptions[layerTitle] : ''}
                            handleZoomToLayer={handleZoomToLayer}
                        />
                        <Accordion type='single' collapsible className='mx-4'>
                            <AccordionItem value="item-2">
                                <AccordionTrigger>
                                    Legend <ChevronDownIcon className="h-4 w-4 shrink-0 transition-transform duration-200 mr-2" />
                                </AccordionTrigger>
                                <AccordionContent>
                                    <>
                                        {isLoading && <div>Loading legend...</div>}
                                        {error && <div>Error loading legend: {error.message}</div>}
                                        {preview?.map((previewItem, index) => (
                                            <div key={index} className='flex items-end space-x-4 py-1'>
                                                <span dangerouslySetInnerHTML={{ __html: previewItem.html.outerHTML || '' }} />
                                                <span>{previewItem.label}</span>
                                            </div>
                                        ))}
                                    </>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    );
};

export { LayerAccordion };
