import { useCallback, useState, useContext } from "react";
import { removeGraphics, createGraphic } from "@/lib/mapping-utils";
import Collection from "@arcgis/core/core/Collection.js";
import { MapContext } from "@/context/map-provider";
import { ColorCodingRecordFunction, GroupLayerProps, LayerProps, LinkFields, RelatedTable, WMSLayerProps, RasterSource, FieldConfig } from "@/lib/types/mapping-types";
import { useGetLayerConfig } from "./use-get-layer-config";

type VisibleLayer = {
    visible: boolean;
    groupLayerTitle: string;
}

export const useMapInteractions = () => {
    const [visibleLayers, setVisibleLayers] = useState<Record<string, VisibleLayer>>();
    const { view } = useContext(MapContext);
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
        rasterSource?: RasterSource;
        schema?: string;
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
                                layerVisibilityMap[sublayerName].visible = true;
                            }
                        });
                    }
                });
            }
        });

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