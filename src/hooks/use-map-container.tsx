import { useRef, useContext, useState, useEffect } from 'react';
import { useSearch } from '@tanstack/react-router';
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
import { wellWithTopsWMSTitle } from '@/pages/ccus/data/layers';
import { findAndApplyWMSFilter } from '@/pages/ccus/components/sidebar/map-configurations/map-configurations';

const preprocessLayerVisibility = (layers: LayerProps[], visibleLayerTitles: Set<string>): LayerProps[] => {
    return layers.map(layer => {
        // Handle group layers
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
    const search = useSearch({ from: '__root__' });
    const { visibleLayerTitles, updateLayerVisibility } = useLayerUrl();

    const featureInfoQuery = useFeatureInfoQuery({
        view,
        wmsUrl,
        visibleLayersMap,
        layerOrderConfigs
    });

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

    // This useEffect handles opening/closing the feature info drawer
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

    // apply filters on initial load
    useEffect(() => {
        // Wait for the map and filters to be ready
        if (!view || !view.map) return;
        const filtersFromUrl = search.filters ?? {};
        const wellFilter = filtersFromUrl[wellWithTopsWMSTitle] || null;
        findAndApplyWMSFilter(view.map, wellWithTopsWMSTitle, wellFilter);
        if (wellFilter) {
            updateLayerVisibility(wellWithTopsWMSTitle, true);
        }
    }, [view, search.filters, updateLayerVisibility]);

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