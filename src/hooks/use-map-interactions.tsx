import { useCallback, useState, useContext } from "react";
import { removeGraphics, createGraphic } from "@/lib/mapping-utils";
import Collection from "@arcgis/core/core/Collection.js";
import { MapContext } from "@/context/map-provider";
import layersConfig from "@/data/layers";
import { GroupLayerProps, LayerProps, WMSLayerProps } from "@/lib/types/mapping-types";

export const useMapInteractions = () => {
    const [visibleLayers, setVisibleLayers] = useState<Record<string, {
        visible: boolean;
        groupLayerTitle: string;
    }>>();
    const { view } = useContext(MapContext);

    type LayerVisibilityMapProps = Record<string, {
        visible: boolean;
        groupLayerTitle: string,
        layerTitle: string;
    }>;

    type VisibleLayersResult = {
        layerVisibilityMap: LayerVisibilityMapProps;
        filteredWMSLayers: __esri.Collection<__esri.Layer>;
    };

    // Type guard to check if the layer is a WMSLayerProps
    function isWMSLayer(layer: LayerProps): layer is WMSLayerProps {
        return layer.type === 'wms';
    }

    // Type guard to check if the layer is a GroupLayerProps
    function isGroupLayer(layer: LayerProps): layer is GroupLayerProps {
        return layer.type === 'group';
    }

    function isWMSMapLayer(layer: __esri.Layer): layer is __esri.WMSLayer {
        return layer.type === 'wms';
    }

    function isGroupMapLayer(layer: __esri.Layer): layer is __esri.GroupLayer {
        return layer.type === 'group';
    }


    // Function to crosscheck and filter WMS layers
    function crossCheckAndFilterWMS({
        layerConfig,
        mapLayers,
    }: {
        layerConfig: LayerProps[];
        mapLayers: __esri.Collection<__esri.Layer>;
    }) {
        const layerVisibilityMap: LayerVisibilityMapProps = {};

        console.log("Step 1: Building visibility map from layerConfig...");

        // Step 1: Build the visibility map from layerConfig
        layerConfig.forEach(layer => {
            if (isWMSLayer(layer) && layer.sublayers) {
                layer.sublayers.forEach(sublayer => {
                    if (sublayer.name) {
                        console.log(`Initializing visibility for WMS sublayer`, sublayer);
                        layerVisibilityMap[sublayer.name] = {
                            visible: false,
                            groupLayerTitle: layer.title || '',
                            layerTitle: sublayer.title || ''
                        };
                    }
                });
            } else if (isGroupLayer(layer)) {
                const groupLayer = layer;
                groupLayer.layers?.forEach(layer => {

                    if (isWMSLayer(layer) && layer.sublayers) {
                        layer.sublayers.forEach(sublayer => {
                            if (sublayer.name) {

                                console.log('groupLayer1:', groupLayer);
                                console.log(`Initializing visibility for nested WMS sublayer`, sublayer);
                                layerVisibilityMap[sublayer.name] = {
                                    visible: false,
                                    groupLayerTitle: groupLayer.title || '',
                                    layerTitle: layer.title || ''
                                };
                            }
                        });
                    }
                });
            }
        });

        console.log("Initial Layer Visibility Map:", layerVisibilityMap);

        console.log("Step 2: Updating visibility based on mapLayers...");

        // Step 2: Update visibility based on mapLayers
        mapLayers.forEach(mapLayer => {
            if (isWMSMapLayer(mapLayer)) {
                console.log(`Processing WMS map layer: ${mapLayer.title}`);
                mapLayer.sublayers.forEach(sublayer => {
                    const sublayerName = sublayer.name;
                    if (
                        sublayerName &&
                        layerVisibilityMap[sublayerName] !== undefined &&
                        mapLayer.visible &&
                        sublayer.visible
                    ) {
                        console.log(`Setting visibility to true for: ${sublayerName}`);
                        layerVisibilityMap[sublayerName].visible = true;
                    }
                });
            } else if (isGroupMapLayer(mapLayer)) {

                console.log(`Processing group map layer: ${mapLayer.title}`);
                mapLayer.layers?.forEach(groupedMapLayer => {
                    if (isWMSMapLayer(groupedMapLayer)) {
                        console.log(`Processing nested WMS layer: ${groupedMapLayer.title}`);
                        groupedMapLayer.sublayers.forEach(sublayer => {
                            const sublayerName = sublayer.name;
                            if (
                                sublayerName &&
                                layerVisibilityMap[sublayerName] !== undefined &&
                                mapLayer.visible &&
                                groupedMapLayer.visible &&
                                sublayer.visible
                            ) {
                                console.log(`Setting visibility to true for: ${sublayerName}`);
                                layerVisibilityMap[sublayerName].visible = true;
                            }
                        });
                    }
                });
            }
        });

        console.log("Final Layer Visibility Map:", layerVisibilityMap);

        console.log("Step 3: Filtering WMS layers based on visibility...");

        // Step 3: Filter WMS layers based on visibility
        const filteredWMSLayers = mapLayers.filter(mapLayer => {
            if (isWMSMapLayer(mapLayer)) {
                return mapLayer.sublayers.some(sublayer =>
                    sublayer.name && layerVisibilityMap[sublayer.name]
                );
            } else if (isGroupMapLayer(mapLayer)) {
                return mapLayer.layers?.some(groupedMapLayer =>
                    isWMSMapLayer(groupedMapLayer) &&
                    groupedMapLayer.sublayers.some(sublayer =>
                        sublayer.name && layerVisibilityMap[sublayer.name]
                    )
                );
            }
            return false;
        });

        console.log("Filtered WMS Layers:", filteredWMSLayers);

        return { layerVisibilityMap, filteredWMSLayers };
    }

    // Handle map click to get visible layers
    const getVisibleLayers = ({ view }: { view: __esri.MapView | __esri.SceneView }): VisibleLayersResult => {
        if (!view) return {
            layerVisibilityMap: {},
            filteredWMSLayers: new Collection(),
        };


        // Step 4: Get the filtered requests
        const { layerVisibilityMap, filteredWMSLayers } = crossCheckAndFilterWMS({ layerConfig: layersConfig, mapLayers: view.map.layers });
        setVisibleLayers(layerVisibilityMap);

        // Step 5: Log the requests
        return { layerVisibilityMap, filteredWMSLayers };
    };


    // Handle right-click to show context menu and update coordinates
    const handleOnContextMenu = useCallback((e: React.MouseEvent<HTMLDivElement>, hiddenTriggerRef: React.RefObject<HTMLDivElement>, setCoordinates: (coordinates: { x: string; y: string }) => void) => {
        e.preventDefault();
        if (view) {
            // offsetX and offsetY are relative to the target element (i.e. the map canvas)
            const { offsetX: x, offsetY: y } = e.nativeEvent;

            // Convert offsetX and offsetX to map coordinates
            const mapPoint = view.toMap({ x: x, y: y });

            // Update selected coordinates with the converted lat/lon
            const { latitude, longitude } = mapPoint;

            // Update your state or context with the new coordinates
            setCoordinates({ x: longitude.toString(), y: latitude.toString() }); // Assuming x = longitude and y = latitude
            removeGraphics(view);
            createGraphic(latitude, longitude, view);
        }

        if (hiddenTriggerRef.current) {
            const contextMenuEvent = new MouseEvent('contextmenu', {
                bubbles: true,
                clientX: e.clientX,
                clientY: e.clientY,
            });
            hiddenTriggerRef.current.dispatchEvent(contextMenuEvent);
        }
    }, [view]);

    return { handleOnContextMenu, visibleLayers, getVisibleLayers };
};
