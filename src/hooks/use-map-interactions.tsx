import { useCallback, useState } from "react";
import Collection from "@arcgis/core/core/Collection.js";
import { useMap } from "@/hooks/use-map";
import { ColorCodingRecordFunction, LayerProps, LinkFields, RelatedTable, RasterSource, FieldConfig } from "@/lib/types/mapping-types";
import { useGetLayerConfig } from "./use-get-layer-config";
import { createPinGraphic, clearGraphics } from "@/lib/map/highlight-utils";
import { isGroupLayer, isGroupMapLayer, isWMSLayer, isWMSMapLayer } from "@/lib/map/utils";

type VisibleLayer = {
    visible: boolean;
    groupLayerTitle: string;
}

/** 
    * This hook manages map interactions, including layer visibility and context menu handling.
    * It provides functionality to get visible layers based on the current map view and layer configuration.
    * It also handles right-click events to show a context menu and update coordinates. 
    * @returns An object containing the context menu handler, visible layers, and a function to get visible layers.
*/
export const useMapInteractions = () => {
    const [visibleLayers, setVisibleLayers] = useState<Record<string, VisibleLayer>>();
    const { view } = useMap();
    const layersConfig = useGetLayerConfig();

    type LayerVisibilityMapProps = Record<string, {
        visible: boolean;
        groupLayerTitle: string,
        layerTitle: string;
        popupFields?: Record<string, FieldConfig>;
        relatedTables?: RelatedTable[];
        queryable?: boolean;
        linkFields?: LinkFields;
        colorCodingMap?: ColorCodingRecordFunction;
        customLayerParameters?: object | null | undefined;
        rasterSource?: RasterSource;
        schema?: string;
    }>;

    type VisibleLayersResult = {
        layerVisibilityMap: LayerVisibilityMapProps;
        filteredWMSLayers: __esri.Collection<__esri.Layer>;
    };

    // Function to crosscheck and filter WMS layers
    function crossCheckAndFilterWMS({
        layerConfig,
        mapLayers,
    }: {
        layerConfig: LayerProps[] | null;
        mapLayers: __esri.Collection<__esri.Layer>;
    }) {
        const layerVisibilityMap: LayerVisibilityMapProps = {};

        // Early return with empty results if layerConfig is null
        if (!layerConfig) {
            return {
                layerVisibilityMap,
                filteredWMSLayers: mapLayers.filter(() => false) // Returns empty collection
            };
        }

        // Step 1: Build the visibility map from layerConfig
        layerConfig.forEach(layer => {
            if (isWMSLayer(layer) && layer.sublayers) {
                layer.sublayers.forEach(sublayer => {
                    if (sublayer.name) {
                        layerVisibilityMap[sublayer.name] = {
                            visible: false,
                            groupLayerTitle: layer.title || '',
                            layerTitle: sublayer.title || '',
                            popupFields: sublayer.popupFields,
                            relatedTables: sublayer.relatedTables,
                            queryable: sublayer.queryable,
                            linkFields: sublayer.linkFields,
                            colorCodingMap: sublayer.colorCodingMap,
                            customLayerParameters: layer.customLayerParameters,
                            rasterSource: sublayer.rasterSource,
                            schema: sublayer.schema,
                        };
                    }
                });
            } else if (isGroupLayer(layer)) {
                const groupLayer = layer;
                groupLayer.layers?.forEach(layer => {
                    if (isWMSLayer(layer) && layer.sublayers) {
                        layer.sublayers.forEach(sublayer => {
                            if (sublayer.name) {
                                layerVisibilityMap[sublayer.name] = {
                                    visible: false,
                                    groupLayerTitle: groupLayer.title || '',
                                    layerTitle: layer.title || '',
                                    popupFields: sublayer.popupFields,
                                    relatedTables: sublayer.relatedTables,
                                    queryable: sublayer.queryable,
                                    linkFields: sublayer.linkFields,
                                    colorCodingMap: sublayer.colorCodingMap,
                                    customLayerParameters: layer.customLayerParameters,
                                    rasterSource: sublayer.rasterSource,
                                    schema: sublayer.schema,
                                };
                            }
                        });
                    }
                });
            }
        });

        // Step 2: Update visibility based on mapLayers
        mapLayers.forEach(mapLayer => {
            if (isWMSMapLayer(mapLayer)) {
                mapLayer.sublayers.forEach(sublayer => {
                    const sublayerName = sublayer.name;
                    if (
                        sublayerName &&
                        layerVisibilityMap[sublayerName] !== undefined &&
                        mapLayer.visible &&
                        sublayer.visible
                    ) {
                        layerVisibilityMap[sublayerName].visible = true;
                    }
                });
            } else if (isGroupMapLayer(mapLayer)) {
                mapLayer.layers?.forEach(groupedMapLayer => {
                    if (isWMSMapLayer(groupedMapLayer)) {
                        groupedMapLayer.sublayers.forEach(sublayer => {
                            const sublayerName = sublayer.name;
                            if (
                                sublayerName &&
                                layerVisibilityMap[sublayerName] !== undefined &&
                                mapLayer.visible &&
                                groupedMapLayer.visible &&
                                sublayer.visible
                            ) {
                                // Ensure layerVisibilityMap[sublayerName] is an object with a visible property
                                if (typeof layerVisibilityMap[sublayerName] === 'object' && layerVisibilityMap[sublayerName] !== null) {
                                    layerVisibilityMap[sublayerName].visible = true;
                                }
                            }
                        });

                    }
                });
            }
        });



        // Step 3: Filter WMS layers based on visibility
        const filteredWMSLayers = mapLayers.filter(mapLayer => {
            if (isWMSMapLayer(mapLayer)) {
                return mapLayer.sublayers.some(sublayer => {
                    const sublayerName = sublayer.name;
                    const isVisible = layerVisibilityMap[sublayerName]?.visible;

                    // Convert condition to a boolean
                    const conditionBool = !!(sublayerName && isVisible);

                    return conditionBool;
                });
            } else if (isGroupMapLayer(mapLayer)) {
                return mapLayer.layers?.some(groupedMapLayer =>
                    isWMSMapLayer(groupedMapLayer) &&
                    groupedMapLayer.sublayers.some(sublayer => {
                        const sublayerName = sublayer.name;
                        const isVisible = layerVisibilityMap[sublayerName]?.visible;

                        // Convert condition to a boolean
                        const conditionBool = !!(sublayerName && isVisible);

                        return conditionBool;
                    })
                );
            }
            return false;
        });

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

            if (mapPoint && mapPoint.latitude && mapPoint.longitude) {
                // Update selected coordinates with the converted lat/lon
                const { latitude, longitude } = mapPoint;

                // Update your state or context with the new coordinates
                setCoordinates({ x: longitude.toString(), y: latitude.toString() }); // Assuming x = longitude and y = latitude
                clearGraphics(view);
                createPinGraphic(latitude, longitude, view);
            }
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