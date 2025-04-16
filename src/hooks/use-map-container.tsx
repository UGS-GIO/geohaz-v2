import { useRef, useContext, useState, useCallback, useEffect } from "react";
import { Feature } from "geojson";
import { MapContext } from '@/context/map-provider';
import { useMapCoordinates } from "@/hooks/use-map-coordinates";
import { useMapInteractions } from "@/hooks/use-map-interactions";
import { useMapUrlParams } from "@/hooks/use-map-url-params";
import { useGetLayerConfig } from "@/hooks/use-get-layer-config";
import { FieldConfig, RelatedTable } from "@/lib/types/mapping-types";
import { fetchWMSFeatureInfo, highlightFeature, reorderLayers } from "@/lib/mapping-utils";
import { LayerOrderConfig } from "@/hooks/use-get-layer-config";
import Point from "@arcgis/core/geometry/Point";

interface PopupContent {
    features: Feature[];
    visible: boolean;
    layerTitle: string;
    groupLayerTitle: string;
    popupFields?: Record<string, FieldConfig>;
    relatedTables?: RelatedTable[];
}

interface MapContainerHookResult {
    mapRef: React.RefObject<HTMLDivElement>;
    contextMenuTriggerRef: React.RefObject<HTMLDivElement>;
    drawerTriggerRef: React.RefObject<HTMLButtonElement>;
    popupContainer: HTMLDivElement | null;
    setPopupContainer: (container: HTMLDivElement | null) => void;
    popupContent: PopupContent[];
    handleMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
    handleMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void;
    handleMouseUp: (e: React.MouseEvent<HTMLDivElement>) => void;
    handleOnContextMenu: (
        e: React.MouseEvent<HTMLDivElement>,
        triggerRef: React.RefObject<HTMLDivElement>,
        setCoords: (coords: { x: string; y: string }) => void
    ) => void;
    coordinates: { x: string; y: string };
    setCoordinates: (coords: { x: string; y: string }) => void;
    view: __esri.MapView | __esri.SceneView | undefined;
    layersConfig: any; // Replace 'any' with your actual layers config type
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
    const [popupContent, setPopupContent] = useState<PopupContent[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [startPos, setStartPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
    const dragThreshold = 5;
    const { zoom, center } = useMapUrlParams(view);
    const layersConfig = useGetLayerConfig();

    // Initialize map when dependencies are ready
    useEffect(() => {
        if (mapRef.current && loadMap && zoom && center && layersConfig) {
            loadMap(mapRef.current, { zoom, center }, layersConfig);
        }
    }, [loadMap, zoom, center, layersConfig]);

    const updatePopupContent = useCallback(
        (newContent: PopupContent[]) => {
            setPopupContent((prevContent) => {
                if (JSON.stringify(prevContent) !== JSON.stringify(newContent)) {
                    return newContent;
                }
                return prevContent;
            });
        },
        [setPopupContent]
    );

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        setStartPos({ x: e.clientX, y: e.clientY });
        setIsDragging(false);
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const distance = Math.sqrt(
            Math.pow(e.clientX - startPos.x, 2) + Math.pow(e.clientY - startPos.y, 2)
        );
        if (distance > dragThreshold) {
            setIsDragging(true);
        }
    };

    const handleMapClick = async (e: React.MouseEvent<HTMLDivElement>) => {
        if (!view || isDragging || isSketching) return;

        view?.graphics.removeAll();

        if (e.button === 0) {
            const layers = getVisibleLayers({ view });
            const visibleLayersMap = layers.layerVisibilityMap;

            const { offsetX: x, offsetY: y } = e.nativeEvent;
            const mapPoint = view.toMap({ x, y }) || new Point();

            const keys = Object.entries(visibleLayersMap)
                .filter(([_, layerInfo]) => layerInfo.visible && layerInfo.queryable)
                .map(([key]) => key);

            const featureInfo = await fetchWMSFeatureInfo({
                mapPoint,
                view,
                layers: keys,
                url: wmsUrl
            });

            if (featureInfo) {
                const layerInfo = await Promise.all(
                    Object.entries(visibleLayersMap).map(async ([key, value]): Promise<any> => {
                        const baseLayerInfo: any = {
                            visible: value.visible,
                            layerTitle: value.layerTitle,
                            groupLayerTitle: value.groupLayerTitle,
                            features: featureInfo.features.filter((feature: Feature) =>
                                feature.id?.toString().includes(key.split(':')[0]) ||
                                feature.id?.toString().split('.')[0].includes(key.split(':')[1])
                            ),
                            ...(value.popupFields && { popupFields: value.popupFields }),
                            ...(value.linkFields && { linkFields: value.linkFields }),
                            ...(value.colorCodingMap && { colorCodingMap: value.colorCodingMap }),
                            ...(value.relatedTables && value.relatedTables.length > 0 && {
                                relatedTables: value.relatedTables.map(table => ({
                                    ...table,
                                    matchingField: table.matchingField || "",
                                    fieldLabel: table.fieldLabel || ""
                                }))
                            }),
                            ...(value.schema && { schema: value.schema }),
                        };

                        if (value.rasterSource) {
                            const rasterFeatureInfo = await fetchWMSFeatureInfo({
                                mapPoint,
                                view,
                                layers: [value.rasterSource.layerName],
                                url: value.rasterSource.url,
                            });
                            baseLayerInfo.rasterSource = {
                                ...value.rasterSource,
                                ...rasterFeatureInfo
                            };
                        }

                        return baseLayerInfo;
                    })
                );

                const layerInfoFiltered = layerInfo.filter(layer => layer.features.length > 0);
                const drawerState = drawerTriggerRef.current?.getAttribute('data-state');

                // Only highlight if we have features
                if (featureInfo.features.length > 0) {
                    highlightFeature(featureInfo.features[0], view);
                }

                // Close the drawer if no features found
                if (layerInfoFiltered.length === 0) {
                    const drawerState = drawerTriggerRef.current?.getAttribute('data-state');
                    if (drawerState === 'open') {
                        drawerTriggerRef.current?.click(); // Close the drawer
                    }
                    return;
                }

                const orderedLayerInfo = layerOrderConfigs.length > 0
                    ? reorderLayers(layerInfoFiltered, layerOrderConfigs)
                    : layerInfoFiltered;

                updatePopupContent(orderedLayerInfo);

                if (drawerState === 'open') {
                    drawerTriggerRef.current?.click();
                    setTimeout(() => drawerTriggerRef.current?.click(), 50);
                } else {
                    drawerTriggerRef.current?.click();
                }
            }
        }
    };

    const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
        handleMapClick(e);
    };

    return {
        mapRef,
        contextMenuTriggerRef,
        drawerTriggerRef,
        popupContainer,
        setPopupContainer,
        popupContent,
        handleMouseDown,
        handleMouseMove,
        handleMouseUp,
        handleOnContextMenu,
        coordinates,
        setCoordinates,
        view,
        layersConfig
    };
}