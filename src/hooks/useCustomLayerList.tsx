import { useContext, useEffect, useState } from 'react';
import { CalciteBlock } from '@esri/calcite-components-react';
import { MapContext } from '../contexts/MapProvider';
import LayerlistAccordion from '../components/widgets/LayerlistAccordion';

const useCustomLayerList = () => {
    const { activeLayers } = useContext(MapContext);
    const [layerList, setLayerList] = useState<__esri.Collection<JSX.Element>>();

    useEffect(() => {
        if (activeLayers) {
            const list = activeLayers.map((layer, index) => {
                if (layer.layer.type === 'group') {
                    return (
                        <CalciteBlock collapsible key={index} heading={layer.title} >
                            {layer.children.map((childLayer, childIndex) => {
                                return <LayerlistAccordion key={childIndex} layer={childLayer} />
                            })}
                        </CalciteBlock>
                    );
                }

                return <LayerlistAccordion key={index} layer={layer} />

            });

            setLayerList(list);
        }
    }, [activeLayers]);

    return layerList;
};

export default useCustomLayerList;