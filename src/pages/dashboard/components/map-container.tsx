import { useRef, useContext, useEffect, useState, useCallback } from "react";
import MapWidgets from './map-widgets';
import { MapContext } from '@/context/map-provider';
import { MapContextMenu } from "./map-context-menu";
import { useMapCoordinates } from "@/hooks/use-map-coordinates";
import { useMapInteractions } from "@/hooks/use-map-interactions";
import { PopupDrawer } from "@/components/custom/popups/popup-drawer";
import useMapUrlParams from "@/hooks/use-map-url-params";
import { Feature } from "geojson";
import { RelatedTable } from "@/lib/types/mapping-types";

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


    interface HandleMapClickProps {
        e: React.MouseEvent<HTMLDivElement>;
        view?: __esri.MapView | __esri.SceneView;
        drawerTriggerRef: React.RefObject<HTMLButtonElement>;
    }

    interface Bbox {
        minX: number;
        minY: number;
        maxX: number;
        maxY: number;
    }

    interface CreateBboxProps {
        mapPoint: __esri.Point;  // Or replace with equivalent Point type of your library
        resolution?: number;     // Optional: map resolution for adjusting bbox size
        buffer?: number;         // Optional: buffer size in map units
    }

    // Create a bounding box around the clicked map point
    function createBbox({ mapPoint, resolution = 1, buffer = 10 }: CreateBboxProps): Bbox {
        // Apply buffer and scale it by resolution if needed
        const scaleFactor = 50; // Scale factor calculated above

        // Apply buffer and scale it by resolution and the calculated scale factor
        const scaledBuffer = buffer * resolution * scaleFactor;

        const minX = mapPoint.x - scaledBuffer;
        const minY = mapPoint.y - scaledBuffer;
        const maxX = mapPoint.x + scaledBuffer;
        const maxY = mapPoint.y + scaledBuffer;

        return {
            minX,
            minY,
            maxX,
            maxY,
        };
    }

    interface GetFeatureInfoProps {
        mapPoint: __esri.Point;  // Replace with your Point type
        view: __esri.MapView | __esri.SceneView;    // Replace with your MapView type
        visibleLayers: string[]; // List of visible layers (layer titles or ids)
    }

    // Fetch GetFeatureInfo request to WMS server
    async function fetchGetFeatureInfo({
        mapPoint,
        view,
        visibleLayers,
    }: GetFeatureInfoProps) {
        if (visibleLayers.length === 0) {
            console.warn('No visible layers to query.');
            return null; // Return null if no visible layers
        }

        // Create a bbox around the clicked map point
        const bbox = createBbox({ mapPoint, resolution: view.resolution, buffer: 10 });
        const { minX, minY, maxX, maxY } = bbox;

        // WMS GetFeatureInfo parameters
        const params = {
            service: 'WMS',
            request: 'GetFeatureInfo',
            version: '1.3.0', // Or '1.1.1' if the server requires
            layers: visibleLayers.join(','),
            query_layers: visibleLayers.join(','),
            info_format: 'application/json',
            bbox: `${minX},${minY},${maxX},${maxY}`,
            crs: 'EPSG:3857',
            i: Math.round(view.width / 2).toString(),
            j: Math.round(view.height / 2).toString(),
            width: `${view.width}`,
            height: `${view.height}`,
            feature_count: "50", // Limit the number of features returned
        };

        const queryString = new URLSearchParams(params).toString();

        // Construct the full URL to the GetFeatureInfo endpoint
        const getFeatureInfoUrl = `https://ugs-geoserver-prod-flbcoqv7oa-uc.a.run.app/geoserver/wms?${queryString}`;

        const response = await fetch(getFeatureInfoUrl);
        if (!response.ok) {
            throw new Error(`GetFeatureInfo request failed with status ${response.status}`);
        }

        const featureInfo = await response.json();

        return featureInfo;
    }


    const updatePopupContent = useCallback(
        (newContent: { features: Feature[]; visible: boolean; layerTitle: string, groupLayerTitle: string, popupFields?: Record<string, string>; relatedTables?: RelatedTable[] }[]) => {
            setPopupContent((prevContent) => {
                console.log('Previous content:', prevContent);

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
            if (zoom && center) {
                loadMap(mapRef.current, { zoom, center });
            }
        }
    }, [loadMap, mapRef, zoom, center]); // Add zoom and center as dependencies

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
        // if (isDragging) return; // Prevent click logic if dragging is happening

        // check if the testdrawer is open. if it is, close and reopen with new content
        // if it isn't, open the testdrawer with the new content



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
            <PopupDrawer container={popupContainer} drawerTriggerRef={drawerTriggerRef} popupContent={popupContent} />
            {/* This div serves as the custom container for the PopupDrawer component.
                By setting its ref, it means the PopupDrawer is appended to this container
                instead of the body element. 
                https://github.com/emilkowalski/vaul?tab=readme-ov-file#custom-container */}
            <div ref={setPopupContainer} />
        </>
    );
}