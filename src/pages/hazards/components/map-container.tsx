import { useRef, useContext, useEffect, useState, useCallback } from "react";
import { MapWidgets } from '@/pages/ccus/components/map-widgets';
import { MapContext } from '@/context/map-provider';
import { MapContextMenu } from "@/components/custom/map/map-context-menu";
import { useMapCoordinates } from "@/hooks/use-map-coordinates";
import { useMapInteractions } from "@/hooks/use-map-interactions";
import { useMapUrlParams } from "@/hooks/use-map-url-params";
import { PopupDrawer } from "@/components/custom/popups/popup-drawer";
import { Feature } from "geojson";
import { RelatedTable } from "@/lib/types/mapping-types";
import { fetchGetFeatureInfo, highlighAndZoomToFeature } from "@/lib/mapping-utils";
import { useGetLayerConfig } from "@/hooks/use-get-layer-config";

export default function ArcGISMap() {
    const mapRef = useRef<HTMLDivElement>(null);
    const { loadMap, view } = useContext(MapContext);
    const { coordinates, setCoordinates } = useMapCoordinates();
    const { handleOnContextMenu, getVisibleLayers } = useMapInteractions();
    const [popupContainer, setPopupContainer] = useState<HTMLDivElement | null>(null);
    const contextMenuTriggerRef = useRef<HTMLDivElement>(null);
    const drawerTriggerRef = useRef<HTMLButtonElement>(null);
    const [popupContent, setPopupContent] = useState<{ features: Feature[]; visible: boolean; layerTitle: string; groupLayerTitle: string }[]>([]);
    // New state for tracking drag
    const [isDragging, setIsDragging] = useState(false);
    const [startPos, setStartPos] = useState<{ x: number, y: number }>({ x: 0, y: 0 });
    const dragThreshold = 5;
    // Get zoom and center from URL params
    const { zoom, center } = useMapUrlParams(view);
    const layersConfig = useGetLayerConfig();


    interface HandleMapClickProps {
        e: React.MouseEvent<HTMLDivElement>;
        view?: __esri.MapView | __esri.SceneView;
        drawerTriggerRef: React.RefObject<HTMLButtonElement>;
    }

    const updatePopupContent = useCallback(
        (newContent: { features: Feature[]; visible: boolean; layerTitle: string, groupLayerTitle: string, popupFields?: Record<string, string>; relatedTables?: RelatedTable[] }[]) => {
            setPopupContent((prevContent) => {
                // Only update if new content is different to avoid unnecessary rerenders
                if (JSON.stringify(prevContent) !== JSON.stringify(newContent)) {
                    return newContent;
                }

                return prevContent; // No state update if content is identical
            });
        },
        [setPopupContent]
    );

    // Initialize the map with URL parameters
    useEffect(() => {
        if (mapRef.current && loadMap) {
            // Check if zoom and center are valid before loading
            if (zoom && center && layersConfig) {
                loadMap(mapRef.current, { zoom, center }, layersConfig);
            }
        }
    }, [loadMap, mapRef, zoom, center, layersConfig]);

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        setStartPos({ x: e.clientX, y: e.clientY });
        setIsDragging(false);
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const distance = Math.sqrt(Math.pow(e.clientX - startPos.x, 2) + Math.pow(e.clientY - startPos.y, 2));
        if (distance > dragThreshold) {
            setIsDragging(true); // Set dragging state if threshold is exceeded
        }
    };


    const handleMapClick = async ({ e, view, drawerTriggerRef }: HandleMapClickProps) => {

        if (!view || isDragging) return; // Skip click if dragging or no view

        view?.graphics.removeAll(); // Clear any existing graphics

        if (e.button === 0) {
            const layers = getVisibleLayers({ view });
            const visibleLayersMap = layers.layerVisibilityMap;

            const { offsetX: x, offsetY: y } = e.nativeEvent;
            const mapPoint = view.toMap({ x, y });

            const keys = Object.entries(visibleLayersMap)
                .filter(([_, layerInfo]) => layerInfo.visible && layerInfo.queryable)
                .map(([key]) => key);

            const featureInfo = await fetchGetFeatureInfo({
                mapPoint,
                view,
                visibleLayers: keys,
            });

            // Update popup content with the new feature info
            if (featureInfo) {
                const layerInfo = Object.entries(visibleLayersMap).map(
                    ([key, value]): {
                        groupLayerTitle: string;
                        layerTitle: string;
                        visible: boolean;
                        features: Feature[];
                        popupFields?: Record<string, string>;
                        relatedTables?: RelatedTable[];
                    } => ({
                        visible: value.visible,
                        layerTitle: value.layerTitle,
                        groupLayerTitle: value.groupLayerTitle,
                        features: featureInfo.features.filter((feature: Feature) =>
                            feature.id?.toString().includes(key.split(':')[0]) ||
                            feature.id?.toString().split('.')[0].includes(key.split(':')[1])
                        ),
                        ...(value.popupFields && { popupFields: value.popupFields }),
                        ...(value.relatedTables && value.relatedTables.length > 0 && {
                            relatedTables: value.relatedTables.map(table => ({
                                ...table,
                                matchingField: table.matchingField || "",  // Default value if missing
                                fieldLabel: table.fieldLabel || ""         // Default value if missing
                            }))
                        }),
                    })
                );

                highlighAndZoomToFeature(featureInfo.features[0], view);

                const layerInfoFiltered = layerInfo.filter(layer => layer.features.length > 0);
                const drawerState = drawerTriggerRef.current?.getAttribute('data-state');

                if (layerInfoFiltered.length === 0) {
                    // do we want the popup to close if no features are found?
                    // Close the drawer if no features found
                    // drawerState === 'open' && drawerTriggerRef.current?.click();
                    return
                }
                updatePopupContent(layerInfoFiltered);
                if (drawerState === 'open') {
                    drawerTriggerRef.current?.click(); // Close drawer first
                    setTimeout(() => drawerTriggerRef.current?.click(), 50); // Reopen with new content
                } else {
                    drawerTriggerRef.current?.click(); // Open drawer
                }
            }
        }
    };

    const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
        handleMapClick({ e, view, drawerTriggerRef });
    };

    return (
        <>
            <MapContextMenu coordinates={coordinates} hiddenTriggerRef={contextMenuTriggerRef} />
            <div
                className="relative w-full h-full"
                ref={mapRef}
                onContextMenu={e => handleOnContextMenu(e, contextMenuTriggerRef, setCoordinates)}  // Trigger context menu on right-click
                onMouseDown={handleMouseDown}  // Start tracking the mouse down
                onMouseMove={handleMouseMove}  // Track mouse movement to detect drag
                onMouseUp={handleMouseUp}      // Trigger click only if no drag detected
            >
                <MapWidgets />
                {/* <div ref={setPopupContainer} className="fixed inset-x-0 flex items-center justify-center"> */}
            </div>
            <PopupDrawer container={popupContainer} drawerTriggerRef={drawerTriggerRef} popupContent={popupContent} popupTitle="Hazards in your area" />
            {/* This div serves as the custom container for the PopupDrawer component.
                By setting its ref, it means the PopupDrawer is appended to this container
                instead of the body element. 
                https://github.com/emilkowalski/vaul?tab=readme-ov-file#custom-container */}
            <div ref={setPopupContainer} />
        </>
    );
}