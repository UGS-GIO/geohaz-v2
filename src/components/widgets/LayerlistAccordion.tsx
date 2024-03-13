import { useContext, useEffect, useState } from 'react'; import { CalciteBlock, CalciteLabel, CalciteSlider, CalciteSwitch, CalciteAccordion, CalciteAccordionItem } from '@esri/calcite-components-react'; import { CalciteSliderCustomEvent } from "@esri/calcite-components"; import { MapContext } from '../../contexts/MapProvider'; import * as symbolUtils from "@arcgis/core/symbols/support/symbolUtils.js"; import { useQuery } from '@tanstack/react-query'; import { MapImageLayerRenderer, RegularLayerRenderer } from '../../config/types/mappingTypes';

interface LayerAccordionProps { layer: __esri.ListItem }

const findLayerById = (layers: __esri.Collection<__esri.ListItem>, id: string) => { const flatLayers = layers.flatten(layer => layer.children || []); return flatLayers.find(layer => String(layer.layer.id) === String(id)); };

const LayerAccordion = ({ layer }: LayerAccordionProps) => {
    const { activeLayers, getRenderer } = useContext(MapContext);
    const [currentLayer, setCurrentLayer] = useState<__esri.ListItem>();
    const [layerVisibility, setLayerVisibility] = useState<boolean | undefined>();
    const [layerOpacity, setLayerOpacity] = useState(1);
    const [preview, setPreview] = useState<{ html: HTMLElement, label: string, title?: string }[]>();

    const layerId = layer.layer.id;
    const layerTitle = layer.layer.title;
    const typeNarrowedLayer = layer.layer as __esri.FeatureLayer | __esri.TileLayer | __esri.MapImageLayer | __esri.ImageryLayer;

    const { data: legendData } = useQuery(
        {
            queryKey: ['legendHTML', layer.layer],
            queryFn: () => getRenderer ? getRenderer(layerId, typeNarrowedLayer.url) : Promise.resolve(undefined),
        }
    );

    useEffect(() => {
        const generatePreview = async (rendererData: MapImageLayerRenderer | RegularLayerRenderer) => {
            let html: HTMLElement | null = null;
            let title = '';
            const label = rendererData.label;

            if ('renderer' in rendererData) {
                html = await symbolUtils.renderPreviewHTML(rendererData.renderer);
            } else if ('imageData' in rendererData) {
                title = rendererData.title;
                const imgHTML = `<img src="data:image/png;base64,${rendererData.imageData}" alt="${label}" />`;
                const range = document.createRange();
                const fragment = range.createContextualFragment(imgHTML);
                html = fragment.firstChild as HTMLElement;
            }

            if (html) {
                return { html, label, title };
            }
            return null;
        };

        const generateAllPreviews = async () => {
            if (legendData) {
                const allRenderers = [...legendData.MapImageLayerRenderer, ...legendData.RegularLayerRenderer];
                const previews = [];
                for (let sublayerIndex = 0; sublayerIndex < allRenderers.length; sublayerIndex++) {
                    const rendererData = allRenderers[sublayerIndex];
                    const preview = await generatePreview(rendererData);
                    if (preview) {
                        previews.push(preview);
                    }
                }
                setPreview(previews);
            }
        };
        generateAllPreviews();
    }, [legendData]);


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
        setLayerVisibility(sublayer.visible ? sublayer.visible : undefined);
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
                                        <CalciteSwitch onCalciteSwitchChange={() => handleSublayerVisibilityToggle(sublayer)} checked={layerVisibility} />
                                    </CalciteLabel>
                                    <CalciteLabel>
                                        Opacity
                                        <CalciteSlider onCalciteSliderChange={(e) => handleSublayerOpacityChange(e, sublayer)} value={sublayer.opacity * 100} />                                    </CalciteLabel>
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