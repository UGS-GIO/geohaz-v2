import { useRef, useState, useEffect } from 'react';
import { useSearch } from '@tanstack/react-router';
import { useMapCoordinates } from "@/hooks/use-map-coordinates";
import { useMapInteractions } from "@/hooks/use-map-interactions";
import { useMapPositionUrlParams } from "@/hooks/use-map-position-url-params";
import { LayerOrderConfig, useGetLayerConfig } from "@/hooks/use-get-layer-config";
import { highlightFeature } from '@/lib/map/highlight-utils';
import { useMapClickOrDrag } from "@/hooks/use-map-click-or-drag";
import { useFeatureInfoQuery } from "@/hooks/use-feature-info-query";
import { useLayerUrl } from '@/context/layer-url-provider';
import { wellWithTopsWMSTitle } from '@/pages/carbonstorage/data/layers';
import { findAndApplyWMSFilter } from '@/pages/carbonstorage/components/sidebar/map-configurations/map-configurations';
import { useMap } from '@/context/map-provider';
import { useLayerVisibility } from '@/hooks/use-layer-visibility';
import { useMapClickHandler } from '@/hooks/use-map-click-handler';

interface UseMapContainerProps {
    wmsUrl: string;
    layerOrderConfigs?: LayerOrderConfig[];
}

export function useMapContainer({ wmsUrl, layerOrderConfigs = [] }: UseMapContainerProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const { loadMap, view, isSketching } = useMap();
    const { coordinates, setCoordinates } = useMapCoordinates();
    const { handleOnContextMenu, getVisibleLayers } = useMapInteractions();
    const [popupContainer, setPopupContainer] = useState<HTMLDivElement | null>(null);
    const contextMenuTriggerRef = useRef<HTMLDivElement>(null);
    const drawerTriggerRef = useRef<HTMLButtonElement>(null);
    useMapPositionUrlParams(view);
    const layersConfig = useGetLayerConfig();
    const [visibleLayersMap, setVisibleLayersMap] = useState({});
    const search = useSearch({ from: '__root__' });
    const { selectedLayerTitles, hiddenGroupTitles, updateLayerSelection } = useLayerUrl();

    const processedLayers = useLayerVisibility(
        layersConfig || [],
        selectedLayerTitles,
        hiddenGroupTitles
    );

    const featureInfoQuery = useFeatureInfoQuery({
        view,
        wmsUrl,
        visibleLayersMap,
        layerOrderConfigs
    });

    // Extract the click handling logic
    const { handleMapClick } = useMapClickHandler({
        view,
        isSketching,
        onPointClick: (mapPoint) => {
            featureInfoQuery.fetchForPoint(mapPoint);
        },
        getVisibleLayers,
        setVisibleLayersMap
    });

    const { clickOrDragHandlers } = useMapClickOrDrag({
        onClick: (e) => {
            handleMapClick({
                screenX: e.nativeEvent.offsetX,
                screenY: e.nativeEvent.offsetY
            });
        }
    });

    useEffect(() => {
        if (featureInfoQuery.isSuccess) {
            const popupContent = featureInfoQuery.data || [];
            const hasFeatures = popupContent.length > 0;
            const firstFeature = popupContent[0]?.features[0];
            const drawerState = drawerTriggerRef.current?.getAttribute('data-state');

            if (hasFeatures && firstFeature && view) {
                highlightFeature(firstFeature, view, popupContent[0].sourceCRS);
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
        if (!view || !view.map) return;
        const filtersFromUrl = search.filters ?? {};
        const wellFilter = filtersFromUrl[wellWithTopsWMSTitle] || null;
        findAndApplyWMSFilter(view.map, wellWithTopsWMSTitle, wellFilter);
        if (wellFilter) {
            updateLayerSelection(wellWithTopsWMSTitle, true);
        }
    }, [view, search.filters, updateLayerSelection]);

    useEffect(() => {
        const center = [search.lon, search.lat] as [number, number];

        if (mapRef.current && loadMap && layersConfig) {
            loadMap({
                container: mapRef.current,
                zoom: search.zoom,
                center,
                layers: processedLayers,
            });
        }
    }, [loadMap, search.zoom, search.lat, search.lon, layersConfig, processedLayers]);

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
        layersConfig: processedLayers
    };
}