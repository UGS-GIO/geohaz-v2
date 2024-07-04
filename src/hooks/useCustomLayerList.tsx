import { useContext, useEffect, useState, useCallback } from 'react';
import { MapContext } from '../contexts/MapProvider';
import LayerlistAccordion from '../components/widgets/LayerlistAccordion';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent, AccordionHeader } from '../components/@/components/ui/accordion';
import { Checkbox } from '../components/@/components/ui/checkbox';

const useCustomLayerList = () => {
    const { activeLayers } = useContext(MapContext);
    const [layerList, setLayerList] = useState<__esri.Collection<JSX.Element>>();
    const [groupLayerVisibility, setGroupLayerVisibility] = useState<Record<string, boolean>>({});

    // Memoize the visibility toggle handler to avoid it changing on every render
    const handleGroupLayerVisibilityToggle = useCallback((layerId: string) => {
        return (newVisibility: boolean) => {
            setGroupLayerVisibility(prevState => ({
                ...prevState,
                [layerId]: newVisibility
            }));

            const layer = activeLayers?.find(l => l.layer.id === layerId);
            if (layer) {
                layer.visible = newVisibility;
            }
        };
    }, [activeLayers]);

    // Separate effect for initializing visibility state
    useEffect(() => {
        if (activeLayers) {
            const initialVisibility = activeLayers.reduce((acc, layer) => {
                if (layer.layer.type === 'group') {
                    acc[layer.layer.id] = layer.visible;
                }
                return acc;
            }, {} as Record<string, boolean>);

            setGroupLayerVisibility(initialVisibility);
        }
    }, [activeLayers]);

    // Effect for updating the layer list
    useEffect(() => {
        if (activeLayers) {
            const list = activeLayers.map((layer, index) => {
                if (layer.layer.type === 'group') {
                    return (
                        <div className='mr-2' key={`accordion-${index}`}>
                            <Accordion type="multiple">
                                <AccordionItem value={`item-${index}`}>
                                    <AccordionHeader>
                                        <Checkbox
                                            checked={groupLayerVisibility[layer.layer.id] || false}
                                            onCheckedChange={handleGroupLayerVisibilityToggle(layer.layer.id)}
                                            className="mx-2"
                                        />
                                        <AccordionTrigger>
                                            <h3 className='text-md font-medium text-left'>{layer.title}</h3>
                                        </AccordionTrigger>
                                    </AccordionHeader>
                                    <AccordionContent>
                                        {layer.children.map((childLayer) => (
                                            <div className='ml-4'>
                                                <LayerlistAccordion key={childLayer.layer.id} layer={childLayer} />
                                            </div>
                                        ))}
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </div>
                    );
                }

                return (
                    <div className='mr-2' key={`layer-${layer.layer.id}`}>
                        <LayerlistAccordion layer={layer} />
                    </div>
                )
            });

            setLayerList(list);
        }
    }, [activeLayers, groupLayerVisibility, handleGroupLayerVisibilityToggle]);

    return layerList;
};

export default useCustomLayerList;
