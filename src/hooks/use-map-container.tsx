import { useRef, useContext, useState, useEffect } from 'react';
import { MapContext } from '@/context/map-provider';
import { useMapCoordinates } from "@/hooks/use-map-coordinates";
import { useMapInteractions } from "@/hooks/use-map-interactions";
import { useMapUrlParams } from "@/hooks/use-map-url-params";
import { LayerOrderConfig, useGetLayerConfig } from "@/hooks/use-get-layer-config";
import { highlightFeature } from '@/lib/mapping-utils';
import Point from '@arcgis/core/geometry/Point';
import { useMapClickOrDrag } from "@/hooks/use-map-click-or-drag";
import { useFeatureInfoQuery } from "@/hooks/use-feature-info-query";
import { LayerContentProps } from '@/components/custom/popups/popup-content-with-pagination';

interface MapContainerHookResult {
    mapRef: React.RefObject<HTMLDivElement>;
    contextMenuTriggerRef: React.RefObject<HTMLDivElement>;
    drawerTriggerRef: React.RefObject<HTMLButtonElement>;
    popupContainer: HTMLDivElement | null;
    setPopupContainer: (container: HTMLDivElement | null) => void;
    popupContent: LayerContentProps[];
    clickOrDragHandlers: {
        onMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
        onMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void;
        onMouseUp: (e: React.MouseEvent<HTMLDivElement>) => void;
    };
    handleOnContextMenu: (
        e: React.MouseEvent<HTMLDivElement>,
        triggerRef: React.RefObject<HTMLDivElement>,
        setCoords: (coords: { x: string; y: string }) => void
    ) => void;
    coordinates: { x: string; y: string };
    setCoordinates: (coords: { x: string; y: string }) => void;
    view: __esri.MapView | __esri.SceneView | undefined;
    layersConfig: any;
}

interface UseMapContainerProps {
    wmsUrl: string;
    layerOrderConfigs?: LayerOrderConfig[];
}

export function useMapContainer({ wmsUrl, layerOrderConfigs = [] }: UseMapContainerProps): MapContainerHookResult {
    const mapRef = useRef<HTMLDivElement>(null);
    const { loadMap, view, isSketching } = useContext(MapContext);
    const { coordinates, setCoordinates } = useMapCoordinates();
    const { handleOnContextMenu, getVisibleLayers } = useMapInteractions();
    const [popupContainer, setPopupContainer] = useState<HTMLDivElement | null>(null);
    const contextMenuTriggerRef = useRef<HTMLDivElement>(null);
    const drawerTriggerRef = useRef<HTMLButtonElement>(null);
    const { zoom, center } = useMapUrlParams(view);
    const layersConfig = useGetLayerConfig();
    const [visibleLayersMap, setVisibleLayersMap] = useState({});

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
            loadMap(mapRef.current, { zoom, center }, layersConfig);
        }
    }, [loadMap, zoom, center, layersConfig]);

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