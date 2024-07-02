import { useContext, useEffect, useState } from 'react';
import { MapContext } from '../contexts/MapProvider';
import LayerlistAccordion from '../components/widgets/LayerlistAccordion';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '../components/@/components/ui/accordion';

const useCustomLayerList = () => {
    const { activeLayers } = useContext(MapContext);
    const [layerList, setLayerList] = useState<__esri.Collection<JSX.Element>>();

    useEffect(() => {
        if (activeLayers) {
            const list = activeLayers.map((layer, index) => {
                if (layer.layer.type === 'group') {
                    return (
                        <Accordion key={index} type="multiple">
                            <AccordionItem value={`item-${index}`}>
                                <AccordionTrigger>{layer.title}</AccordionTrigger>
                                <AccordionContent>
                                    {layer.children.map((childLayer) => (
                                        <LayerlistAccordion layer={childLayer} />

                                    ))}
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    );
                }

                return <LayerlistAccordion layer={layer} />;
            });

            setLayerList(list);
        }
    }, [activeLayers]);

    return layerList;
};

export default useCustomLayerList;
