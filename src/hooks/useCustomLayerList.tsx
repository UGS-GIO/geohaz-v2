import { useContext, useEffect, useState } from 'react';
import { MapContext } from '../contexts/MapProvider';
import LayerlistAccordion from '../components/widgets/LayerlistAccordion';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '../components/@/components/ui/accordion';
import { Switch } from '../components/@/components/ui/switch';

const useCustomLayerList = () => {
    const { activeLayers } = useContext(MapContext);
    const [layerList, setLayerList] = useState<__esri.Collection<JSX.Element>>();
    const [groupLayerVisibility, setGroupLayerVisibility] = useState<Record<string, boolean>>({});

    const handleGroupLayerVisibilityToggle = (layerId: string) => {
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
    };

    useEffect(() => {
        if (activeLayers) {
            // Initialize the visibility state for each group layer
            const initialVisibility = activeLayers.reduce((acc, layer) => {
                if (layer.layer.type === 'group') {
                    acc[layer.layer.id] = layer.visible;
                }
                return acc;
            }, {} as Record<string, boolean>);

            setGroupLayerVisibility(initialVisibility);

            const list = activeLayers.map((layer, index) => {
                if (layer.layer.type === 'group') {
                    return (
                        <Accordion key={index} type="multiple">
                            <AccordionItem value={`item-${index}`}>
                                <AccordionTrigger>
                                    <Switch
                                        className='ml-2'
                                        id={`${layer.title}-visibility`}
                                        checked={groupLayerVisibility[layer.layer.id] || false}
                                        onClick={(e) => e.stopPropagation()}
                                        onCheckedChange={handleGroupLayerVisibilityToggle(layer.layer.id)}
                                    />
                                    {layer.title}
                                </AccordionTrigger>
                                <AccordionContent>
                                    {layer.children.map((childLayer) => (
                                        <LayerlistAccordion key={childLayer.layer.id} layer={childLayer} />
                                    ))}
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    );
                }

                return <LayerlistAccordion key={layer.layer.id} layer={layer} />;
            });

            setLayerList(list);
        }
    }, [activeLayers, groupLayerVisibility]);

    return layerList;
};

export default useCustomLayerList;
