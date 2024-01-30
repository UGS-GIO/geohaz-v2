import { useContext, useEffect, useState } from 'react';
import { CalciteBlock } from '@esri/calcite-components-react';
import { MapContext } from '../contexts/MapProvider';
import LayerAccordion from '../components/widgets/LayerlistAccordion';

const useCustomLayerList = () => {
    const { activeLayers } = useContext(MapContext);
    const [layerList, setLayerList] = useState<__esri.Collection<JSX.Element>>();

    useEffect(() => {
        if (activeLayers) {
            const list = activeLayers.map((layer, index) => {
                if (layer.layer.type === 'group') {
                    return (
                        <CalciteBlock collapsible key={index} heading={layer.title} className='mb-1'>
                            {layer.children.map((childLayer, childIndex) => (
                                <LayerAccordion key={childIndex} layerName={childLayer.title} layerId={childLayer.layer.id} />
                            ))}
                        </CalciteBlock>
                    );
                }

                return <LayerAccordion key={index} layerName={layer.layer.title} layerId={layer.layer.id} />;
            });

            setLayerList(list);
        }
    }, [activeLayers]);

    return layerList;
};

export default useCustomLayerList;