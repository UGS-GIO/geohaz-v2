import { useContext, useEffect, useRef, useState } from 'react';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent, AccordionHeader } from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { MapContext } from '@/context/map-provider';
import LayerControls from '@/components/custom/layer-controls';
import { useSidebar } from '@/hooks/use-sidebar';
import { useFetchLayerDescriptions } from '@/hooks/use-fetch-layer-descriptions';
import { Switch } from '@/components/ui/switch';
import { useLayerExtent } from '@/hooks/use-layer-extent';
import Extent from '@arcgis/core/geometry/Extent';
import { useLayerVisibilityManager } from '@/hooks/use-layer-visibility-manager';
import Collection from '@arcgis/core/core/Collection';

export type TypeNarrowedLayer = __esri.FeatureLayer | __esri.MapImageLayer | __esri.WMSLayer
interface LayerAccordionProps {
    layer: __esri.Layer;
    isTopLevel: boolean;
    forceUpdate?: boolean;
    onVisibilityChange?: (checked: boolean) => void;
}

const LayerAccordion = ({ layer, isTopLevel, forceUpdate, onVisibilityChange }: LayerAccordionProps) => {
    const { id: layerId, title: layerTitle } = layer;
    const { view } = useContext(MapContext);
    const typeNarrowedLayer = layer as TypeNarrowedLayer;
    const isMobile = window.innerWidth < 768;
    const { setIsCollapsed, setNavOpened } = useSidebar();
    const { data: layerDescriptions, isLoading: isDescriptionsLoading, error: descriptionsError } = useFetchLayerDescriptions();
    const [localVisibility, setLocalVisibility] = useState(layer.visible);

    const { refetch: fetchExtent, data: cachedExtent, isLoading } = useLayerExtent(typeNarrowedLayer);

    const handleZoomToLayer = async () => {
        try {
            // Only fetch if we don't have cached data
            const extent = cachedExtent || await fetchExtent().then(result => result.data);

            if (isLoading) {
                return;
            }

            if (extent) {
                const arcgisExtent = new Extent({
                    xmin: extent.xmin,
                    ymin: extent.ymin,
                    xmax: extent.xmax,
                    ymax: extent.ymax,
                    spatialReference: { wkid: 4326 }
                });

                view?.goTo(arcgisExtent);

                // Make parent group visible if it exists
                if (currentLayer?.parent) {
                    handleGroupLayerVisibilityToggle(true);
                }

                // Make the layer visible
                updateLayer(layer => {
                    layer.visible = true;
                });

                // Handle mobile UI
                if (isMobile) {
                    setIsCollapsed(true);
                    setNavOpened(false);
                }
            }
        } catch (error) {
            console.error("Error in handleZoomToLayer:", error);
        }
    };

    const {
        currentLayer,
        layerOpacity,
        updateLayer,
        handleGroupLayerVisibilityToggle
    } = useLayerVisibilityManager(layer);

    // Update local visibility when the layer's visibility changes externally
    useEffect(() => {
        setLocalVisibility(layer.visible);
    }, [layer.visible, forceUpdate]);

    const handleChildVisibilityToggle = (checked: boolean) => {
        setLocalVisibility(checked);
        updateLayer(layer => {
            layer.visible = checked;
        });
        // Call the onVisibilityChange callback if provided
        onVisibilityChange?.(checked);
    };

    const handleOpacityChange = (value: number) => updateLayer(layer => {
        layer.opacity = value / 100;
    });

    if (isDescriptionsLoading) return <div>Loading...</div>;
    if (descriptionsError) return <div>Error: {descriptionsError.message}</div>;

    return (
        <div key={layerId}>
            <Accordion type="single" collapsible>
                <AccordionItem value="item-1">
                    <AccordionHeader>
                        {
                            isTopLevel && (
                                // use switch for top level layers
                                <Switch
                                    checked={localVisibility}
                                    onCheckedChange={handleChildVisibilityToggle}
                                    className="mx-2"
                                />
                            )
                        }
                        {
                            !isTopLevel && (
                                // use checkbox for child layers
                                <Checkbox
                                    checked={localVisibility}
                                    onCheckedChange={handleChildVisibilityToggle}
                                    className="mx-2"
                                />
                            )
                        }
                        <AccordionTrigger>
                            <h3 className={`text-md font-medium text-left ${isTopLevel ? 'text-md' : ''}`}>{layerTitle}</h3>
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

const GroupLayerItem = ({ layer, index }: { layer: __esri.GroupLayer; index: number }) => {
    const { handleToggleAll, handleChildLayerToggle, handleGroupVisibilityToggle, localState, accordionTriggerRef } = useLayerVisibilityManager(layer);
    const invertedChildLayers = [...layer.layers].reverse(); // inverse the order of the layers to match the order in the map
    const defaultValues = [`${localState.groupVisibility ? `item-${index}` : ''}`]; // if group is visible, expand the accordion

    return (
        <div className="mr-2 border border-secondary rounded my-2">
            <Accordion type="multiple" defaultValue={defaultValues}>
                <AccordionItem value={`item-${index}`}>
                    <AccordionHeader>
                        <Switch
                            checked={localState.groupVisibility}
                            onCheckedChange={handleGroupVisibilityToggle}
                            className="mx-2"
                        />
                        <AccordionTrigger asChild>
                            <button ref={accordionTriggerRef}>
                                <h3 className="font-medium text-left text-md">{layer.title}</h3>
                            </button>
                        </AccordionTrigger>
                    </AccordionHeader>
                    <AccordionContent>
                        <div className="flex items-center space-x-2 ml-2">
                            <Checkbox
                                checked={localState.selectAllChecked}
                                onCheckedChange={(checked: boolean) => handleToggleAll(checked)}
                            />
                            <label className="text-sm font-medium italic">Select All</label>
                        </div>
                        {invertedChildLayers?.map((childLayer) => (
                            <div className="ml-4" key={childLayer.id}>
                                <LayerAccordion
                                    layer={childLayer}
                                    isTopLevel={false}
                                    onVisibilityChange={(checked) => handleChildLayerToggle(childLayer, checked, layer)}
                                />
                            </div>
                        ))}
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    );
};


const useCustomLayerList = () => {
    const { activeLayers } = useContext(MapContext);
    const [layerList, setLayerList] = useState<__esri.Collection<JSX.Element>>();

    useEffect(() => {
        if (activeLayers) {
            const invertedGroupLayers = [...activeLayers].reverse(); // inverse the order of the layers to match the order in the map
            const list = invertedGroupLayers.map((layer, index) => {
                if (layer.type === 'group') {
                    return <GroupLayerItem key={layer.id} layer={layer as __esri.GroupLayer} index={index} />;
                }

                return (
                    <div className='mr-2 my-2 border border-secondary rounded' key={layer.id}>
                        <LayerAccordion layer={layer} isTopLevel={true} />
                    </div>
                );
            });

            setLayerList(new Collection(list));
        }

        return () => {
            setLayerList(undefined);
        }
    }, [activeLayers]);

    return layerList;
};

export { useCustomLayerList };