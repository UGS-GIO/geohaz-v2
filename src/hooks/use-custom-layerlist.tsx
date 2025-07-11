import { useMemo, useContext, useState } from 'react';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent, AccordionHeader } from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { useGetLayerConfig } from '@/hooks/use-get-layer-config';
import { useLayerItemState } from '@/hooks/use-layer-item-state';
import { LayerProps } from '@/lib/types/mapping-types';
import { MapContext } from '@/context/map-provider';
import { findLayerByTitle } from '@/lib/mapping-utils'; // Assuming you have this helper
import { useLayerExtent } from '@/hooks/use-layer-extent';
import { useFetchLayerDescriptions } from '@/hooks/use-fetch-layer-descriptions';
import { useSidebar } from '@/hooks/use-sidebar';
import LayerControls from '@/components/custom/layer-controls';
import Extent from '@arcgis/core/geometry/Extent';
import { useIsMobile } from './use-mobile';
import Layer from '@arcgis/core/layers/Layer';

const LayerAccordionItem = ({ layerConfig, isTopLevel }: { layerConfig: LayerProps; isTopLevel: boolean }) => {
    const { isVisible, toggleVisibility, groupState } = useLayerItemState(layerConfig);
    const { view } = useContext(MapContext);
    const { setIsCollapsed, setNavOpened } = useSidebar();
    const { data: layerDescriptions } = useFetchLayerDescriptions();
    const [accordionValue, setAccordionValue] = useState<string>("");
    const isMobile = useIsMobile();
    const liveLayer = useMemo(() => {
        if (!view?.map || !layerConfig.title) return null;
        return findLayerByTitle(view.map, layerConfig.title);
    }, [view, view?.map.allLayers, layerConfig.title]);
    const { refetch: fetchExtent, data: cachedExtent, isLoading: isExtentLoading } = useLayerExtent(liveLayer || new Layer());

    console.log(liveLayer?.type);



    const handleOpacityChange = (value: number) => {
        if (liveLayer) {
            liveLayer.opacity = value / 100;
        }
    };

    const handleZoomToLayer = async () => {
        if (!liveLayer || isExtentLoading) return;
        try {
            const extent = cachedExtent || await fetchExtent().then(result => result.data);
            if (extent) {
                view?.goTo(new Extent({ ...extent, spatialReference: { wkid: 4326 } }));
                toggleVisibility();
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

    // Group Layer Rendering
    if (layerConfig.type === 'group' && 'layers' in layerConfig) {
        const invertedChildLayers = [...(layerConfig.layers || [])].reverse();

        return (
            <div className="mr-2 border border-secondary rounded my-2">
                <Accordion type="single" collapsible defaultValue={isVisible ? "item-1" : ""}>
                    <AccordionItem value="item-1">
                        <AccordionHeader>
                            <Switch checked={isVisible} onCheckedChange={toggleVisibility} className="mx-2" />
                            <AccordionTrigger>
                                <h3 className="font-medium text-left text-md">{layerConfig.title}</h3>
                            </AccordionTrigger>
                        </AccordionHeader>
                        <AccordionContent key={layerConfig.title}>
                            <div className="flex items-center space-x-2 ml-2">
                                <Checkbox
                                    checked={groupState === 'all'}
                                    data-state={groupState === 'some' ? 'indeterminate' : 'checked'}
                                    onCheckedChange={toggleVisibility}
                                />
                                <label className="text-sm font-medium italic">Select All</label>
                            </div>
                            {invertedChildLayers.map((child) => (
                                <div className="ml-4" key={`${child.title}`}>
                                    <LayerAccordionItem layerConfig={child} isTopLevel={false} />
                                </div>
                            ))}
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>
        );
    }

    let typedLayer: __esri.FeatureLayer | __esri.MapImageLayer | __esri.WMSLayer | null = null;


    switch (liveLayer?.type) {
        case 'feature':
            typedLayer = liveLayer as __esri.FeatureLayer;
            break;
        case 'map-image':
            typedLayer = liveLayer as __esri.MapImageLayer;
            break;
        case 'wms':
            typedLayer = liveLayer as __esri.WMSLayer;
            break;
        default:
            break;
    }

    // Single Layer Rendering
    return (
        <div className={`mr-2 my-2 ${isTopLevel ? 'border border-secondary rounded' : ''}`}>
            <Accordion
                type="single"
                collapsible
                value={accordionValue}
                onValueChange={setAccordionValue}
            >
                <AccordionItem value="item-1">
                    <AccordionHeader>
                        {isTopLevel ? (
                            <Switch checked={isVisible} onCheckedChange={toggleVisibility} className="mx-2" />
                        ) : (
                            <Checkbox checked={isVisible} onCheckedChange={toggleVisibility} className="mx-2" />
                        )}
                        <AccordionTrigger>
                            <h3 className={`text-md font-medium text-left`}>{layerConfig.title}</h3>
                        </AccordionTrigger>
                    </AccordionHeader>
                    <AccordionContent>
                        <LayerControls
                            layerOpacity={typedLayer?.opacity ?? 1}
                            handleOpacityChange={handleOpacityChange}
                            title={layerConfig.title || ''}
                            description={layerDescriptions ? layerDescriptions[layerConfig.title || ''] : ''}
                            handleZoomToLayer={handleZoomToLayer}
                            layerId={typedLayer?.id || ''}
                            url={typedLayer?.url || ''}
                            openLegend={true}
                        />
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    );
};


// This is the main hook your UI will call to get the list of layer components.
export const useCustomLayerList = () => {
    const layersConfig = useGetLayerConfig();

    const layerList = useMemo(() => {
        if (!layersConfig) return [];
        return [...layersConfig].map(layer => (
            <LayerAccordionItem key={layer.title} layerConfig={layer} isTopLevel={true} />
        ));
    }, [layersConfig]);

    return layerList;
};