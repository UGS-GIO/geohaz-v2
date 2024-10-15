import { useContext, useEffect, useState, useCallback } from 'react';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent, AccordionHeader } from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { MapContext } from '@/context/map-provider';
// import { LayerAccordion } from '@/components/custom/layerlist-accordion';
import LayerControls from '@/components/custom/layer-controls';
import { useSidebar } from '@/hooks/use-sidebar';
import { findLayerById } from '@/lib/mapping-utils';
import { LayerListContext } from '@/context/layerlist-provider';

const useGroupLayerVisibility = (activeLayers: __esri.Collection<__esri.Layer> | undefined) => {
    const { groupLayerVisibility, setGroupLayerVisibility } = useContext(LayerListContext);

    // Initialize group layer visibility state based on active layers
    useEffect(() => {
        if (activeLayers) {
            const initialVisibility = activeLayers.reduce((acc, layer) => {
                if (layer.type === 'group') {
                    acc[layer.id] = layer.visible;
                }
                return acc;
            }, {} as Record<string, boolean>);

            setGroupLayerVisibility(initialVisibility);
        }
    }, [activeLayers]);

    // Memoized handler for toggling visibility
    const handleGroupLayerVisibilityToggle = useCallback((layerId: string) => {
        return (newVisibility: boolean) => {
            setGroupLayerVisibility(prevState => ({
                ...prevState,
                [layerId]: newVisibility
            }));

            const layer = activeLayers?.find(layer => layer.id === layerId);
            if (layer) {
                layer.visible = newVisibility;
            }
        };
    }, [activeLayers]);

    return { groupLayerVisibility, handleGroupLayerVisibilityToggle };
};

const useLayerVisibility = (layer: __esri.Layer) => {
    const { activeLayers } = useContext(MapContext);
    const [currentLayer, setCurrentLayer] = useState<__esri.Layer>();
    const [layerVisibility, setLayerVisibility] = useState<boolean>(layer.visible);
    const [layerOpacity, setLayerOpacity] = useState<number>(layer.opacity || 1);
    const { id: layerId } = layer;

    useEffect(() => {
        if (activeLayers && layerId) {
            const foundLayer = findLayerById(activeLayers, layerId);
            if (foundLayer) {
                setCurrentLayer(foundLayer);
                setLayerVisibility(foundLayer.visible);
                setLayerOpacity(foundLayer.opacity || 1);
            }
        }
    }, [activeLayers, layerId]);

    return { currentLayer, layerVisibility, layerOpacity, setLayerVisibility, setLayerOpacity };
}

interface LayerAccordionProps {
    layer: __esri.Layer;
    isTopLevel: boolean;
}

const LayerAccordion = ({ layer, isTopLevel }: LayerAccordionProps) => {
    const { id: layerId, title: layerTitle } = layer;
    const { view, layerDescriptions, activeLayers } = useContext(MapContext);

    const typeNarrowedLayer = layer as __esri.FeatureLayer | __esri.MapImageLayer | __esri.WMSLayer;
    const isMobile = window.innerWidth < 768;
    const { setIsCollapsed, setNavOpened } = useSidebar();
    const { currentLayer, layerVisibility, layerOpacity, setLayerVisibility, setLayerOpacity } = useLayerVisibility(layer);
    const { handleGroupLayerVisibilityToggle } = useGroupLayerVisibility(activeLayers);

    const updateLayer = (updateFn: (layer: __esri.Layer) => void) => {
        if (currentLayer) {
            updateFn(currentLayer);
            setLayerVisibility(currentLayer.visible);
            setLayerOpacity(currentLayer.opacity || 1);
        }
    };

    const handleVisibilityToggle = () => updateLayer(layer => {
        layer.visible = !layer.visible;
    });

    const handleOpacityChange = (value: number) => updateLayer(layer => {
        layer.opacity = value / 100;
    });

    const handleZoomToLayer = () => {
        if (currentLayer && currentLayer.fullExtent) {
            // zoom to the layer's full extent
            view?.goTo(currentLayer.fullExtent);

            // if the layer is in a group, make sure the group (parent) is set to visible
            if (currentLayer.parent) {
                const currentGroupLayerParent = currentLayer as __esri.GroupLayer;
                handleGroupLayerVisibilityToggle(currentGroupLayerParent.id)(true);
            }

            // update the layer visibility to true
            updateLayer(layer => {
                layer.visible = true;
            });

            // if on mobile, collapse the sidebar and close the nav
            if (isMobile) {
                setIsCollapsed(true);
                setNavOpened(false);
            }
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
                            layerId={layerId}
                            url={typeNarrowedLayer.url}
                        />
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    );
};


const useCustomLayerList = () => {
    const { activeLayers } = useContext(MapContext);
    const [layerList, setLayerList] = useState<__esri.Collection<JSX.Element>>();

    // Use the custom hook for managing group layer visibility
    const { groupLayerVisibility, handleGroupLayerVisibilityToggle } = useGroupLayerVisibility(activeLayers);

    // Effect for updating the layer list
    useEffect(() => {
        if (activeLayers) {
            const list = activeLayers.map((layer, index) => {
                if (layer.type === 'group') {
                    const groupLayer = layer as __esri.GroupLayer;
                    return (
                        <div className='mr-2 border border-secondary rounded my-2' key={`accordion-${index}`}>
                            <Accordion type="multiple" >
                                <AccordionItem value={`item-${index}`}>
                                    <AccordionHeader>
                                        <Checkbox
                                            checked={groupLayerVisibility[groupLayer.id] || false}
                                            onCheckedChange={handleGroupLayerVisibilityToggle(layer.id)}
                                            className="mx-2"
                                        />
                                        <AccordionTrigger>
                                            <h3 className='font-medium text-left text-lg'>{layer.title}</h3>
                                        </AccordionTrigger>
                                    </AccordionHeader>
                                    <AccordionContent>
                                        {groupLayer.layers?.map((childLayer) => (
                                            <div className='ml-4' key={childLayer.id}>
                                                <LayerAccordion key={childLayer.id} layer={childLayer} isTopLevel={false} />
                                            </div>
                                        ))}
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </div>
                    );
                }

                return (
                    <div className='mr-2 my-2 border border-secondary rounded' key={`layer-${layer.id}`}>
                        <LayerAccordion layer={layer} isTopLevel={true} />
                    </div>
                );
            });

            setLayerList(list);
        }
    }, [activeLayers, groupLayerVisibility, handleGroupLayerVisibilityToggle]);

    return layerList;
};

export { useCustomLayerList };
