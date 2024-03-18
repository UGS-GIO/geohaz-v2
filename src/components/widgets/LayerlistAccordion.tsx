import { useContext, useEffect, useState } from 'react';
import { CalciteBlock, CalciteLabel, CalciteSlider, CalciteSwitch, CalciteAccordion, CalciteAccordionItem } from '@esri/calcite-components-react';
import { CalciteSliderCustomEvent } from "@esri/calcite-components";
import { MapContext } from '../../contexts/MapProvider';
import useLegendPreview from '../../hooks/useLegendPreview';

interface LayerAccordionProps { layer: __esri.ListItem }

const findLayerById = (layers: __esri.Collection<__esri.ListItem>, id: string) => { const flatLayers = layers.flatten(layer => layer.children || []); return flatLayers.find(layer => String(layer.layer.id) === String(id)); };

const LayerAccordion = ({ layer }: LayerAccordionProps) => {
    const { id: layerId, title: layerTitle } = layer.layer;
    const { activeLayers, getRenderer } = useContext(MapContext);
    const [currentLayer, setCurrentLayer] = useState<__esri.ListItem>();
    const [layerVisibility, setLayerVisibility] = useState<boolean | undefined>();
    const [sublayerVisibility, setSublayerVisibility] = useState<Record<string, boolean>>({});
    const [layerOpacity, setLayerOpacity] = useState(1);
    const typeNarrowedLayer = layer.layer as __esri.FeatureLayer | __esri.TileLayer | __esri.MapImageLayer | __esri.ImageryLayer;
    const preview = useLegendPreview(layer.layer.id, typeNarrowedLayer.url, getRenderer);

    useEffect(() => {
        if (activeLayers && layerId) {
            const foundLayer = findLayerById(activeLayers, layerId);
            setCurrentLayer(foundLayer);
            setLayerVisibility(foundLayer?.visible);
            setLayerOpacity(foundLayer?.layer.opacity || 1);
        }
    }, [activeLayers, layerId]);

    const updateLayer = (updateFn: (layer: __esri.Layer | __esri.Sublayer) => void) => {
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

    const handleSublayerVisibilityToggle = (sublayer: __esri.Sublayer) => {
        sublayer.visible = !sublayer.visible;
        setSublayerVisibility(prevState => ({ ...prevState, [sublayer.id]: sublayer.visible }));
    };

    const handleSublayerOpacityChange = (event: CalciteSliderCustomEvent<void>, sublayer: __esri.Sublayer) => {
        sublayer.opacity = Number(event.target.value) / 100;
        setLayerOpacity(sublayer.opacity);
    };
    function isMapImageLayer(layer: __esri.Layer): layer is __esri.MapImageLayer {
        return layer.type === "map-image";
    }


    return (
        <CalciteBlock heading={`${layerTitle}`} collapsible >
            <CalciteAccordion>
                {isMapImageLayer(typeNarrowedLayer) && typeNarrowedLayer.sublayers && typeNarrowedLayer.sublayers.length > 0 ? (
                    typeNarrowedLayer.sublayers.map((sublayer: __esri.Sublayer, index: number) => {
                        return (
                            <CalciteAccordionItem heading={sublayer.title} key={index}>
                                {preview && preview.map((previewItem, index) => {
                                    if (previewItem.title === sublayer.title) {
                                        return (
                                            <div key={index} className='flex items-end space-x-4 py-1'>
                                                <span dangerouslySetInnerHTML={{ __html: previewItem.html.outerHTML || '' }} />
                                                <span>{previewItem.label}</span>
                                            </div>
                                        );
                                    }
                                    return null;
                                })}
                                <CalciteAccordionItem heading={`${sublayer.title} Controls`}>
                                    <CalciteLabel layout="inline">
                                        Visibility
                                        <CalciteSwitch onCalciteSwitchChange={() => handleSublayerVisibilityToggle(sublayer)} checked={sublayerVisibility[sublayer.id]} />
                                    </CalciteLabel>
                                    <CalciteLabel>
                                        Opacity
                                        <CalciteSlider onCalciteSliderChange={(e) => handleSublayerOpacityChange(e, sublayer)} value={sublayer.opacity * 100} />
                                    </CalciteLabel>
                                </CalciteAccordionItem>
                            </CalciteAccordionItem>
                        )
                    })
                ) : (
                    <CalciteAccordionItem heading={`${layerTitle}`}>
                        {preview && preview.map((preview, index) => (
                            <div key={index} className='flex items-end space-x-4 py-1'>
                                <span dangerouslySetInnerHTML={{ __html: preview.html.outerHTML || '' }} />
                                <span>{preview.label}</span>
                            </div>
                        ))}
                    </CalciteAccordionItem>
                )}
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
}

export default LayerAccordion;