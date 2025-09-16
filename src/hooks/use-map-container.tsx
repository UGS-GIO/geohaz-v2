import { useRef, useState, useEffect, useMemo } from 'react';
import { useMapCoordinates } from "@/hooks/use-map-coordinates";
import { useMapInteractions } from "@/hooks/use-map-interactions";
import { useMapPositionUrlParams } from "@/hooks/use-map-position-url-params";
import { LayerOrderConfig, useGetLayerConfig } from "@/hooks/use-get-layer-config";
import { useMapClickOrDrag } from "@/hooks/use-map-click-or-drag";
import { useFeatureInfoQuery } from "@/hooks/use-feature-info-query";
import { useLayerUrl } from '@/context/layer-url-provider';
import { useMap } from '@/hooks/use-map';
import { useLayerVisibility } from '@/hooks/use-layer-visibility';
import { useMapClickHandler } from '@/hooks/use-map-click-handler';
import { useFeatureResponseHandler } from '@/hooks/use-feature-response-handler';
import { useMapUrlSync } from '@/hooks/use-map-url-sync';
import { useDomainFilters } from '@/hooks/use-domain-filters';
import { createCoordinateAdapter, CoordinateAdapter } from '@/lib/map/coordinate-adapter';

interface UseMapContainerProps {
    wmsUrl: string;
    layerOrderConfigs?: LayerOrderConfig[];
    layersConfig: ReturnType<typeof useGetLayerConfig>;
    mapType?: 'arcgis' | 'maplibre'; // New prop to specify map type
}

/**
 * Main map container hook that orchestrates all map-related functionality.
 * Coordinates layer visibility, click handling, feature queries, and URL synchronization.
 * Designed to be gradually migrated from ArcGIS to MapLibre by extracting concerns
 * into separate, testable hooks.
 * 
 * @param wmsUrl - Base URL for WMS feature info queries
 * @param layerOrderConfigs - Optional configuration for reordering layers in popups
 * @param mapType - Type of map library to use ('arcgis' or 'maplibre')
 * @returns Map container state and event handlers
 */
export function useMapContainer({
    wmsUrl,
    layerOrderConfigs = [],
    layersConfig,
    mapType = 'arcgis'
}: UseMapContainerProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const { loadMap, view, isSketching } = useMap();
    const { coordinates, setCoordinates } = useMapCoordinates();
    const { handleOnContextMenu, getVisibleLayers } = useMapInteractions({ layersConfig: layersConfig });
    const [popupContainer, setPopupContainer] = useState<HTMLDivElement | null>(null);
    const contextMenuTriggerRef = useRef<HTMLDivElement>(null);
    const drawerTriggerRef = useRef<HTMLButtonElement>(null);
    useMapPositionUrlParams(view);
    const [visibleLayersMap, setVisibleLayersMap] = useState({});
    const { selectedLayerTitles, hiddenGroupTitles, updateLayerSelection } = useLayerUrl();

    // Create coordinate adapter based on map type
    const coordinateAdapter: CoordinateAdapter = useMemo(() => {
        return createCoordinateAdapter(mapType);
    }, [mapType]);

    // Extract URL synchronization
    const { center, zoom, filters } = useMapUrlSync();

    // Extract domain-specific filter handling
    useDomainFilters({ view, filters, updateLayerSelection });

    // Process layers based on visibility state
    const processedLayers = useLayerVisibility(
        layersConfig || [],
        selectedLayerTitles,
        hiddenGroupTitles
    );

    // Feature info query handling with coordinate adapter
    const featureInfoQuery = useFeatureInfoQuery({
        view,
        wmsUrl,
        visibleLayersMap,
        layerOrderConfigs,
        coordinateAdapter
    });

    // Handle side effects of feature query responses
    useFeatureResponseHandler({
        isSuccess: featureInfoQuery.isSuccess,
        featureData: featureInfoQuery.data || [],
        view,
        drawerTriggerRef
    });

    // Handle map clicks with coordinate adapter
    const { handleMapClick } = useMapClickHandler({
        view,
        isSketching,
        onPointClick: (mapPoint) => {
            featureInfoQuery.fetchForPoint(mapPoint);
        },
        getVisibleLayers,
        setVisibleLayersMap,
        coordinateAdapter
    });

    // Handle click or drag events on the map
    const { clickOrDragHandlers } = useMapClickOrDrag({
        onClick: (e) => {
            handleMapClick({
                screenX: e.nativeEvent.offsetX,
                screenY: e.nativeEvent.offsetY
            });
        }
    });

    // Initialize the map when the container is ready
    useEffect(() => {
        if (mapRef.current && loadMap && layersConfig) {
            loadMap({
                container: mapRef.current,
                zoom,
                center,
                layers: processedLayers,
            });
        }
    }, [loadMap, zoom, center, layersConfig, processedLayers]);

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
        layersConfig: processedLayers,
    };
}