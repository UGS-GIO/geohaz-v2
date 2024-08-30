import { useContext, useEffect, useState, useCallback } from 'react';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent, AccordionHeader } from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { MapContext } from '@/context/map-provider';
// import { LayerAccordion } from '@/components/custom/layerlist-accordion';
import LayerControls from '@/components/custom/layer-controls';
import { useSidebar } from '@/hooks/use-sidebar';
import { findLayerById } from '@/lib/mapping-utils';
import { LayerListContext } from '@/context/layerlist-provider';

const useGroupLayerVisibility = (activeLayers: __esri.Collection<__esri.ListItem> | undefined) => {
    const { groupLayerVisibility, setGroupLayerVisibility } = useContext(LayerListContext);

    // Initialize group layer visibility state based on active layers
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

    useEffect(() => {
        console.log('what is groupLayerVisibility', groupLayerVisibility);

        return () => {
            console.log('cleaning up groupLayerVisibility');
        };
    }, [groupLayerVisibility]);


    // Memoized handler for toggling visibility
    const handleGroupLayerVisibilityToggle = useCallback((layerId: string) => {
        console.log('executing handleGroupLayerVisibilityToggle');

        return (newVisibility: boolean) => {
            console.log('setting visibility for layer', layerId, newVisibility);

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

    return { groupLayerVisibility, handleGroupLayerVisibilityToggle };
};

const useLayerVisibility = (layer: __esri.ListItem) => {
    const { activeLayers } = useContext(MapContext);
    const [currentLayer, setCurrentLayer] = useState<__esri.ListItem>();
    const [layerVisibility, setLayerVisibility] = useState<boolean>(layer.layer.visible);
    const [layerOpacity, setLayerOpacity] = useState<number>(layer.layer.opacity || 1);
    const { id: layerId } = layer.layer;

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

    return { currentLayer, layerVisibility, layerOpacity, setLayerVisibility, setLayerOpacity };
}

interface LayerAccordionProps {
    layer: __esri.ListItem;
    isTopLevel: boolean;
}

const LayerAccordion = ({ layer, isTopLevel }: LayerAccordionProps) => {
    const { id: layerId, title: layerTitle } = layer.layer;
    const { view, layerDescriptions, activeLayers } = useContext(MapContext);

    const typeNarrowedLayer = layer.layer as __esri.FeatureLayer | __esri.MapImageLayer | __esri.WMSLayer;
    const isMobile = window.innerWidth < 768;
    const { setIsCollapsed, setNavOpened } = useSidebar();
    const { currentLayer, layerVisibility, layerOpacity, setLayerVisibility, setLayerOpacity } = useLayerVisibility(layer);
    const { handleGroupLayerVisibilityToggle } = useGroupLayerVisibility(activeLayers);

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
            // zoom to the layer's full extent
            view?.goTo(currentLayer.layer.fullExtent);

            // if the layer is in a group, make sure the group is set to visible
            if (currentLayer.parent) {
                handleGroupLayerVisibilityToggle(currentLayer.parent.layer.id)(true);
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

    useEffect(() => {
        console.log('gadnklgdkln;amgklndanklagdnklagnlkgadklngadlnkagdlnkgdgdklnagndkla', groupLayerVisibility);
    }, [groupLayerVisibility]);

    // Effect for updating the layer list
    useEffect(() => {
        console.log('running useCustomLayerList effect');

        if (activeLayers) {
            const list = activeLayers.map((layer, index) => {
                if (layer.layer.type === 'group') {
                    return (
                        <div className='mr-2 border border-secondary rounded my-2' key={`accordion-${index}`}>
                            <Accordion type="multiple" >
                                <AccordionItem value={`item-${index}`}>
                                    <AccordionHeader>
                                        <Checkbox
                                            checked={groupLayerVisibility[layer.layer.id] || false}
                                            onCheckedChange={handleGroupLayerVisibilityToggle(layer.layer.id)}
                                            className="mx-2"
                                        />
                                        <AccordionTrigger>
                                            <h3 className='font-medium text-left text-lg'>{layer.title}</h3>
                                        </AccordionTrigger>
                                    </AccordionHeader>
                                    <AccordionContent>
                                        {layer.children.map((childLayer) => (
                                            <div className='ml-4' key={childLayer.layer.id}>
                                                <LayerAccordion key={childLayer.layer.id} layer={childLayer} isTopLevel={false} />
                                            </div>
                                        ))}
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </div>
                    );
                }

                return (
                    <div className='mr-2 my-2 border border-secondary rounded' key={`layer-${layer.layer.id}`}>
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
