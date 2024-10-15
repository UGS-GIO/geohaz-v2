import { useRef, useContext, useEffect, useState } from "react";
import MapWidgets from './map-widgets';
import { MapContext } from '@/context/map-provider';
import { MapContextMenu } from "./map-context-menu";
import { useMapCoordinates } from "@/hooks/use-map-coordinates";
import { PopupDrawer } from "@/components/custom/popup-drawer";
import { useMapInteractions } from "@/hooks/use-map-interactions";
import { TestDrawer } from "@/components/custom/test-drawer";

export default function ArcGISMap() {
    const mapRef = useRef<HTMLDivElement>(null);
    const { loadMap, view } = useContext(MapContext);
    const { coordinates, setCoordinates } = useMapCoordinates();
    const { handleOnContextMenu, getVisibleLayers } = useMapInteractions();
    const [popupContainer, setPopupContainer] = useState<HTMLDivElement | null>(null);
    const contextMenuTriggerRef = useRef<HTMLDivElement>(null);
    const drawerTriggerRef = useRef<HTMLButtonElement>(null);

    // New state for tracking drag
    const [isDragging, setIsDragging] = useState(false);
    const [startPos, setStartPos] = useState<{ x: number, y: number }>({ x: 0, y: 0 });
    const dragThreshold = 5; // Adjust this value to your liking

    useEffect(() => {
        if (mapRef.current && loadMap) {
            loadMap(mapRef.current);
        }
    }, [mapRef, loadMap]);

    interface HandleMapClickProps {
        e: React.MouseEvent<HTMLDivElement>;
        view?: __esri.MapView | __esri.SceneView;
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

    function createBbox({ mapPoint, resolution = 1, buffer = 10 }: CreateBboxProps): Bbox {
        // Apply buffer and scale it by resolution if needed
        const scaledBuffer = buffer * resolution;

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
        visibleLayers: __esri.Collection<string>; // List of visible layers (layer titles or ids)
    }

    async function fetchGetFeatureInfo({
        mapPoint,
        view,
        visibleLayers,
    }: GetFeatureInfoProps) {
        if (visibleLayers.length === 0) {
            console.warn('No visible layers to query.');
            return;
        }

        // Create a bbox around the clicked map point
        const bbox = createBbox({ mapPoint, resolution: view.resolution, buffer: 10 });
        const { minX, minY, maxX, maxY } = bbox;

        // WMS GetFeatureInfo parameters
        const params = {
            service: 'WMS',
            request: 'GetFeatureInfo',
            version: '1.3.0', // Adjust based on your WMS version
            layers: visibleLayers.join(','),
            query_layers: visibleLayers.join(','), // Must match LAYERS
            info_format: 'application/json', // Expecting JSON response
            bbox: `${minX},${minY},${maxX},${maxY}`,
            crs: 'EPSG:3857', // Adjust to match your coordinate system
            i: Math.round(view.width / 2).toString(),  // X pixel coordinate of the click
            j: Math.round(view.height / 2).toString(), // Y pixel coordinate of the click
            width: `${view.width}`,
            height: `${view.height}`,
            x: Math.round(mapPoint.x).toString(),
            y: Math.round(mapPoint.y).toString(),
            // You can also add styles, srs, etc.
        };
        console.log('params:', params);


        const queryString = new URLSearchParams(params).toString();

        // Construct the full URL to the GetFeatureInfo endpoint
        const getFeatureInfoUrl = `https://your-wms-server-url?${queryString}`;

        try {
            // Make the GetFeatureInfo request
            const response = await fetch(getFeatureInfoUrl);
            if (!response.ok) {
                throw new Error(`GetFeatureInfo request failed with status ${response.status}`);
            }

            const featureInfo = await response.json();

            console.log('GetFeatureInfo response:', featureInfo);

            // You can now use the featureInfo in your popup or drawer
            return featureInfo;

        } catch (error) {
            console.error('Error fetching GetFeatureInfo:', error);
        }
    }


    const handleMapClick = async ({ e, view }: HandleMapClickProps) => {

        if (!view || isDragging) return; // Skip click if dragging

        if (e.button === 0) {
            const layers = getVisibleLayers({ view });
            if (!layers || layers.length === 0) {
                console.warn('No visible layers to query.');
                return;
            }
            layers.map(layer => {
                console.log('layertitle:', layer.title)
                console.log('layer:', layer)
            });

            const { offsetX: x, offsetY: y } = e.nativeEvent;
            const mapPoint = view.toMap({ x: x, y: y });

            // Send GetFeatureInfo request with visible layers and map point
            const featureInfo = await fetchGetFeatureInfo({
                mapPoint,
                view,
                visibleLayers: layers.map(layer => layer.title), // Adjust to use appropriate layer identifier
            });

            if (featureInfo) {
                // Handle the response, e.g., populate popup or drawer with feature info
                console.log('Feature Info:', featureInfo);
            }


            // Update selected coordinates with the converted lat/lon
            // const { latitude, longitude } = mapPoint;

            console.log('extent:', view.extent);

            // const popupContent = `
            //     <div>
            //         <h3>Visible Layers</h3>
            //         <p>${layerInfo}</p>
            //     </div>
            // `;

            const drawerState = drawerTriggerRef.current?.getAttribute('data-state');
            if (drawerTriggerRef.current && drawerState === 'open') {
                drawerTriggerRef.current.click(); // Close the drawer
                console.log('trying to open drawer');

            } else {
                drawerTriggerRef.current?.click(); // Open the drawer'
                console.log('trying to close drawer');
            }
        }
    };

    // view?.on('click', (e) => { console.log('viewclick e :', view.resolution) });


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

    const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isDragging) {
            handleMapClick({ e, view }); // Only trigger click if no drag detected
        }
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
            <TestDrawer container={popupContainer} drawerTriggerRef={drawerTriggerRef} />
            {/* This div serves as the custom container for the PopupDrawer component.
                By setting its ref, it means the PopupDrawer is appended to this container
                instead of the body element. 
                https://github.com/emilkowalski/vaul?tab=readme-ov-file#custom-container */}
            <div ref={setPopupContainer} />
        </>
    );
}
