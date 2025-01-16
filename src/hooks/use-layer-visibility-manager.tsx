import { LayerListContext } from "@/context/layerlist-provider";
import { MapContext } from "@/context/map-provider";
import { findLayerById } from "@/lib/mapping-utils";
import { useContext, useState, useEffect, useCallback } from "react";

const useLayerVisibilityManager = (layer: __esri.Layer) => {
    const { activeLayers } = useContext(MapContext);
    const { groupLayerVisibility, setGroupLayerVisibility } = useContext(LayerListContext);
    const [currentLayer, setCurrentLayer] = useState<__esri.Layer>();
    const [layerVisibility, setLayerVisibility] = useState<boolean>(layer.visible);
    const [layerOpacity, setLayerOpacity] = useState<number>(layer.opacity || 1);
    const { id: layerId } = layer;

    useEffect(() => {
        if (activeLayers && layerId) {
            const foundLayer = findLayerById(activeLayers, layerId);
            if (foundLayer) {
                setCurrentLayer(foundLayer);
                setLayerVisibility(foundLayer.visible);
                setLayerOpacity(foundLayer.opacity || 1);
            }
        }
    }, [activeLayers, layerId]);

    const updateLayer = useCallback((updateFn: (layer: __esri.Layer) => void) => {
        if (currentLayer) {
            updateFn(currentLayer);
            setLayerVisibility(currentLayer.visible);
            setLayerOpacity(currentLayer.opacity || 1);

            if (currentLayer.parent && currentLayer.visible) {
                const parentLayer = currentLayer.parent as __esri.GroupLayer;
                parentLayer.visible = true;
                setGroupLayerVisibility(prev => ({
                    ...prev,
                    [parentLayer.id]: true
                }));
            }
        }
    }, [currentLayer, setGroupLayerVisibility]);

    const handleGroupLayerVisibilityToggle = useCallback((newVisibility: boolean) => {

        if (currentLayer?.type === 'group') {
            const groupLayer = currentLayer as __esri.GroupLayer;
            groupLayer.visible = newVisibility;

            setGroupLayerVisibility(prev => ({
                ...prev,
                [groupLayer.id]: newVisibility
            }));
        }
    }, [currentLayer, setGroupLayerVisibility]);


    const toggleAllSublayers = useCallback(() => {
        if (currentLayer?.type === 'group') {
            const groupLayer = currentLayer as __esri.GroupLayer;
            const allVisible = groupLayer.layers?.every(layer => layer.visible);
            const newVisibility = !allVisible;

            groupLayer.layers?.forEach((sublayer) => {
                sublayer.visible = newVisibility;
            });

            groupLayer.visible = newVisibility;
            setGroupLayerVisibility(prev => ({
                ...prev,
                [groupLayer.id]: newVisibility
            }));
        }
    }, [currentLayer, setGroupLayerVisibility]);

    return {
        currentLayer,
        layerVisibility,
        layerOpacity,
        updateLayer,
        handleGroupLayerVisibilityToggle,
        groupLayerVisibility,
        toggleAllSublayers
    };
};

export { useLayerVisibilityManager };