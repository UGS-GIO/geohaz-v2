import React, { useMemo, useContext, useState, useEffect } from 'react';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent, AccordionHeader } from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { useGetLayerConfig } from '@/hooks/use-get-layer-config';
import { useLayerItemState } from '@/hooks/use-layer-item-state';
import { LayerProps } from '@/lib/types/mapping-types';
import { MapContext } from '@/context/map-provider';
import { findLayerByTitle } from '@/lib/mapping-utils';
import { useLayerExtent } from '@/hooks/use-layer-extent';
import { useFetchLayerDescriptions } from '@/hooks/use-fetch-layer-descriptions';
import { useSidebar } from '@/hooks/use-sidebar';
import LayerControls from '@/components/custom/layer-controls';
import Extent from '@arcgis/core/geometry/Extent';
import { useIsMobile } from './use-mobile';
import Layer from '@arcgis/core/layers/Layer';

const LayerAccordionItem = ({ layerConfig, isTopLevel }: { layerConfig: LayerProps; isTopLevel: boolean }) => {
    const {
        isSelected,
        handleToggleSelection,
        groupIsSelected,
        handleSelectAllToggle,
    } = useLayerItemState(layerConfig);

    const { view } = useContext(MapContext);
    const { setIsCollapsed, setNavOpened } = useSidebar();
    const { data: layerDescriptions } = useFetchLayerDescriptions();
    const [accordionValue, setAccordionValue] = useState<string>(
        // On initial load, open the accordion if the group or layer is active.
        (isSelected || groupIsSelected) ? "item-1" : ""
    );
    const isMobile = useIsMobile();

    const liveLayer = useMemo(() => {
        if (!view?.map || !layerConfig.title) return null;
        return findLayerByTitle(view.map, layerConfig.title);
    }, [view, view?.map.allLayers, layerConfig.title]);

    const { refetch: fetchExtent, data: cachedExtent, isLoading: isExtentLoading } = useLayerExtent(liveLayer || new Layer());

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
                handleToggleSelection(true);
                if (isMobile) {
                    setIsCollapsed(true);
                    setNavOpened(false);
                }
            }
        } catch (error) {
            console.error("Error in handleZoomToLayer:", error);
        }
    };

    // --- Group Layer Rendering ---
    if (layerConfig.type === 'group' && 'layers' in layerConfig) {
        const childLayers = [...(layerConfig.layers || [])];

        return (
            <div className="mr-2 border border-secondary rounded my-1">
                <Accordion
                    type="single"
                    collapsible
                    value={accordionValue}
                    onValueChange={setAccordionValue}
                >
                    <AccordionItem value="item-1">
                        <AccordionHeader>
                            {/* <Switch checked={groupIsSelected} onCheckedChange={handleSelectAllToggle} className="mx-2" /> */}
                            {/* create a switch that toggles the visibility of the sublayers in place but doesn't actually check or uncheck and boxes */}

                            <AccordionTrigger>
                                <h3 className="font-medium text-left text-md">{layerConfig.title}</h3>
                            </AccordionTrigger>
                        </AccordionHeader>
                        <AccordionContent>
                            <div className="flex items-center space-x-2 ml-2">
                                <Checkbox
                                    checked={groupIsSelected}
                                    onCheckedChange={handleSelectAllToggle}
                                />
                                <label className="text-sm font-medium italic">Select All</label>
                            </div>
                            {childLayers.map((child) => (
                                <div className="ml-4" key={child.title}>
                                    <LayerAccordionItem layerConfig={child} isTopLevel={false} />
                                </div>
                            ))}
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>
        );
    }

    // --- Single Layer Rendering ---
    let typedLayer: __esri.FeatureLayer | __esri.MapImageLayer | __esri.WMSLayer | null = null;
    if (liveLayer) {
        switch (liveLayer.type) {
            case 'feature': typedLayer = liveLayer as __esri.FeatureLayer; break;
            case 'map-image': typedLayer = liveLayer as __esri.MapImageLayer; break;
            case 'wms': typedLayer = liveLayer as __esri.WMSLayer; break;
            default: break;
        }
    }

    return (
        <div className={`mr-2 my-1 ${isTopLevel ? 'border border-secondary rounded' : ''}`}>
            <Accordion
                type="single"
                collapsible
                value={accordionValue}
                onValueChange={setAccordionValue}
            >
                <AccordionItem value="item-1">
                    <AccordionHeader>
                        {isTopLevel ? (
                            <Switch checked={isSelected} onCheckedChange={(checked) => handleToggleSelection(checked)} className="mx-2" />
                        ) : (
                            <Checkbox
                                checked={isSelected}
                                onCheckedChange={(checkedState) => {
                                    // checkedState can be boolean or 'indeterminate' so we handle both cases
                                    // to play nice with the handleToggleSelection function
                                    if (typeof checkedState === 'boolean') {
                                        handleToggleSelection(checkedState);
                                    } else if (checkedState === 'indeterminate') {
                                        handleToggleSelection(true);
                                    }
                                }}
                                className="mx-2"
                            />)}
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


export const useCustomLayerList = () => {
    const layersConfig = useGetLayerConfig();

    const layerList = useMemo(() => {
        if (!layersConfig) return [];
        return [...layersConfig].reverse().map(layer => (
            <LayerAccordionItem key={layer.title} layerConfig={layer} isTopLevel={true} />
        ));
    }, [layersConfig]);

    return layerList;
};