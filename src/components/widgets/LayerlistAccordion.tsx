import { useContext, useEffect, useState } from 'react';
import { CalciteAccordion, CalciteAccordionItem } from '@esri/calcite-components-react';
import { CalciteSliderCustomEvent } from "@esri/calcite-components";
import { MapContext } from '../../contexts/MapProvider';
import LayerControls from '../LayerControls';
import { findLayerById } from '../../config/mapping';

interface LayerAccordionProps { layer: __esri.ListItem }

const LayerAccordion = ({ layer }: LayerAccordionProps) => {
    const { id: layerId, title: layerTitle } = layer.layer;
    const { activeLayers, layerDescriptions } = useContext(MapContext);
    const [currentLayer, setCurrentLayer] = useState<__esri.ListItem>();
    const [layerVisibility, setLayerVisibility] = useState<boolean | undefined>();
    const [sublayerVisibility, setSublayerVisibility] = useState<Record<string, boolean>>({});
    const [layerOpacity, setLayerOpacity] = useState(1);
    const typeNarrowedLayer = layer.layer as __esri.FeatureLayer | __esri.TileLayer | __esri.MapImageLayer | __esri.ImageryLayer;
    useEffect(() => {
        if (activeLayers && layerId) {
            const foundLayer = findLayerById(activeLayers, layerId);
            setCurrentLayer(foundLayer);
            setLayerVisibility(foundLayer?.visible);
            setLayerOpacity(foundLayer?.layer.opacity || 1);

            // Initialize sublayerVisibility
            if (isMapImageLayer(foundLayer.layer) && foundLayer.layer.sublayers) {
                const initialSublayerVisibility: Record<string, boolean> = {};
                foundLayer.layer.sublayers.forEach(sublayer => {
                    initialSublayerVisibility[String(sublayer.id)] = sublayer.visible;
                });
                setSublayerVisibility(initialSublayerVisibility);
            }
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
        <CalciteAccordion className='mb-2'>
            {isMapImageLayer(typeNarrowedLayer) && typeNarrowedLayer.sublayers && typeNarrowedLayer.sublayers.length > 0 ? (
                <CalciteAccordionItem expanded heading={layerTitle}>
                    {
                        typeNarrowedLayer.sublayers.map((sublayer: __esri.Sublayer, index: number) => {
                            return (
                                <CalciteAccordionItem heading={sublayer.title} key={index} expanded>
                                    <div className="flex flex-col items-start" key={index}>
                                        <LayerControls
                                            layerVisibility={sublayerVisibility[sublayer.id] || undefined}
                                            handleVisibilityToggle={() => handleSublayerVisibilityToggle(sublayer)}
                                            layerOpacity={sublayer.opacity}
                                            handleOpacityChange={(e) => handleSublayerOpacityChange(e, sublayer)}
                                            title={sublayer.title}
                                            description={layerDescriptions ? layerDescriptions[sublayer.title] : ''}
                                        />
                                        {/* {preview && preview.map((previewItem, index) => {
                                            if (previewItem.title === sublayer.title) {
                                                return (
                                                    <div key={index} className='flex items-end space-x-4 py-1'>
                                                        <span dangerouslySetInnerHTML={{ __html: previewItem.html.outerHTML || '' }} />
                                                        <span>{previewItem.label}</span>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        })} */}
                                    </div>
                                </CalciteAccordionItem>
                            )
                        })
                    }
                </CalciteAccordionItem>
            ) : (
                <CalciteAccordionItem expanded heading={layerTitle}>
                    <div className="flex flex-col items-start">
                        <LayerControls
                            layerVisibility={layerVisibility || undefined}
                            handleVisibilityToggle={handleVisibilityToggle}
                            layerOpacity={layerOpacity}
                            handleOpacityChange={handleOpacityChange}
                            title={layerTitle}
                            description={layerDescriptions ? layerDescriptions[layerTitle] : ''}
                        />
                        {/* {preview && preview.map((preview, index) => (
                            <div key={index} className='flex items-end space-x-4 py-1'>
                                <span dangerouslySetInnerHTML={{ __html: preview.html.outerHTML || '' }} />
                                <span>{preview.label}</span>
                            </div>
                        ))} */}
                    </div>
                </CalciteAccordionItem>
            )}
        </CalciteAccordion>
    );
}

export default LayerAccordion;