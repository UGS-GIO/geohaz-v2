import { useRef, useContext, useState, useEffect } from 'react';
import { MapContext } from '@/context/map-provider';
import { useMapCoordinates } from "@/hooks/use-map-coordinates";
import { useMapInteractions } from "@/hooks/use-map-interactions";
import { useMapPositionUrlParams } from "@/hooks/use-map-position-url-params";
import { LayerOrderConfig, useGetLayerConfig } from "@/hooks/use-get-layer-config";
import { highlightFeature } from '@/lib/mapping-utils';
import Point from '@arcgis/core/geometry/Point';
import { useMapClickOrDrag } from "@/hooks/use-map-click-or-drag";
import { useFeatureInfoQuery } from "@/hooks/use-feature-info-query";
import { LayerProps } from '@/lib/types/mapping-types';
import { useLayerUrl } from '@/context/layer-url-provider';

/**
 * Recursively updates the visibility of layers based on a set of visible titles.
 * This function should live in a utility file (e.g., /lib/mapping-utils.ts)
 */
const preprocessLayerVisibility = (layers: LayerProps[], visibleLayerTitles: Set<string>): LayerProps[] => {
    return layers.map(layer => {
        // Handle group layers recursively
        if (layer.type === 'group' && 'layers' in layer) {
            const newChildLayers = preprocessLayerVisibility(layer.layers || [], visibleLayerTitles);
            const isGroupVisible = newChildLayers.some(child => child.visible);
            return { ...layer, visible: isGroupVisible, layers: newChildLayers };
        }
        // Handle single layers
        return { ...layer, visible: visibleLayerTitles.has(layer.title || '') };
    });
}

interface UseMapContainerProps {
    wmsUrl: string;
    layerOrderConfigs?: LayerOrderConfig[];
}

export function useMapContainer({ wmsUrl, layerOrderConfigs = [] }: UseMapContainerProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const { loadMap, view, isSketching } = useContext(MapContext);
    const { coordinates, setCoordinates } = useMapCoordinates();
    const { handleOnContextMenu, getVisibleLayers } = useMapInteractions();
    const [popupContainer, setPopupContainer] = useState<HTMLDivElement | null>(null);
    const contextMenuTriggerRef = useRef<HTMLDivElement>(null);
    const drawerTriggerRef = useRef<HTMLButtonElement>(null);
    const { zoom, center } = useMapPositionUrlParams(view);
    const layersConfig = useGetLayerConfig();
    const [visibleLayersMap, setVisibleLayersMap] = useState({});
    const { visibleLayerTitles } = useLayerUrl();

    const { clickOrDragHandlers } = useMapClickOrDrag({
        onClick: (e) => {
            if (!view || isSketching) return;
            view.graphics.removeAll();
            const layers = getVisibleLayers({ view });
            setVisibleLayersMap(layers.layerVisibilityMap);
            const mapPoint = view.toMap({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY }) || new Point();
            featureInfoQuery.fetchForPoint(mapPoint);
        }
    });

    const featureInfoQuery = useFeatureInfoQuery({
        view,
        wmsUrl,
        visibleLayersMap,
        layerOrderConfigs
    });

    useEffect(() => {
        if (featureInfoQuery.isSuccess) {
            const popupContent = featureInfoQuery.data || [];
            const hasFeatures = popupContent.length > 0;
            const firstFeature = popupContent[0]?.features[0];
            const drawerState = drawerTriggerRef.current?.getAttribute('data-state');

            if (hasFeatures && firstFeature && view) {
                highlightFeature(firstFeature, view);
            }
            if (!hasFeatures && drawerState === 'open') {
                drawerTriggerRef.current?.click();
            } else if (hasFeatures && drawerState !== 'open') {
                drawerTriggerRef.current?.click();
            }
        }
    }, [featureInfoQuery.isSuccess, featureInfoQuery.data, view]);

    useEffect(() => {
        if (mapRef.current && loadMap && zoom && center && layersConfig) {
            const finalLayersConfig = preprocessLayerVisibility(layersConfig, visibleLayerTitles);
            loadMap({
                container: mapRef.current,
                zoom,
                center,
                layers: finalLayersConfig,
            });
        }
    }, [loadMap, zoom, center, layersConfig, visibleLayerTitles]);

    return {
        mapRef,
        contextMenuTriggerRef,
        drawerTriggerRef,
        popupContainer,
        setPopupContainer,
        popupContent: featureInfoQuery.data || [],
        clickOrDragHandlers,
        handleOnContextMenu,
        coordinates,
        setCoordinates,
        view,
        layersConfig
    };
}