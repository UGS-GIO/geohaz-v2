import { LayerListContext } from "@/context/layerlist-provider";
import { MapContext } from "@/context/map-provider";
import { findLayerById } from "@/lib/mapping-utils";
import { useContext, useState, useEffect, useCallback, useRef } from "react";

const useLayerVisibilityManager = (layer: __esri.Layer) => {
    const { activeLayers } = useContext(MapContext);
    const { groupLayerVisibility, setGroupLayerVisibility } = useContext(LayerListContext);
    const [currentLayer, setCurrentLayer] = useState<__esri.Layer>(layer);
    const [layerVisibility, setLayerVisibility] = useState<boolean>(layer.visible);
    const [layerOpacity, setLayerOpacity] = useState<number>(layer.opacity ?? 1);
    const { id: layerId } = layer;
    const accordionTriggerRef = useRef<HTMLButtonElement>(null);

    interface LocalState {
        selectAllChecked: boolean;
        groupVisibility: boolean;
    }

    const [localState, setLocalState] = useState<LocalState>(() => {
        const typedLayer = layer as __esri.GroupLayer;
        return ({
            groupVisibility: layer.visible,
            selectAllChecked: typedLayer.layers?.every(childLayer => childLayer.visible) ?? false
        })
    });

    useEffect(() => {
        if (activeLayers && layerId) {
            const foundLayer = findLayerById(activeLayers, layerId);
            if (foundLayer && foundLayer !== currentLayer) {
                setCurrentLayer(foundLayer);
            }
        }
    }, [activeLayers, layerId, currentLayer]);

    const ensureParentsVisible = useCallback((layerWhoseParentsToCheck: __esri.Layer) => {
        if (!layerWhoseParentsToCheck.parent) return;

        let parent = layerWhoseParentsToCheck.parent as __esri.Layer | __esri.Map;
        const newContextVisibilityUpdates: Record<string, boolean> = {};
        let anyParentVisibilityChanged = false;

        while (parent && 'type' in parent && parent.type === 'group') {
            const groupParent = parent as __esri.GroupLayer;
            if (!groupParent.visible) {
                groupParent.visible = true;
                newContextVisibilityUpdates[groupParent.id] = true;
                anyParentVisibilityChanged = true;
            }
            parent = groupParent.parent as __esri.Layer | __esri.Map;
        }

        if (anyParentVisibilityChanged) {
            setGroupLayerVisibility(prev => ({
                ...prev,
                ...newContextVisibilityUpdates,
            }));
        }
    }, [setGroupLayerVisibility]);

    useEffect(() => {
        if (!currentLayer) {
            // If currentLayer was initially undefined and now set by the effect above,
            // we might need to re-evaluate setting it from the `layer` prop first.
            // The current initialization `useState<__esri.Layer>(layer)` handles this.
            return;
        }

        const visibilityHandle = currentLayer.watch('visible', (newVisibility: boolean) => {
            setLayerVisibility(newVisibility);

            if (newVisibility) {
                ensureParentsVisible(currentLayer);
            }

            if (currentLayer.type === 'group') {
                setLocalState(prev => ({
                    ...prev,
                    groupVisibility: newVisibility
                }));
            }
        });

        const opacityHandle = currentLayer.watch('opacity', (newOpacity: number) => {
            setLayerOpacity(newOpacity);
        });

        let childWatchers: __esri.WatchHandle[] = []; // Corrected type
        if (currentLayer.type === 'group') {
            const groupLayer = currentLayer as __esri.GroupLayer;
            groupLayer.layers?.forEach(childLayer => {
                const childHandle = childLayer.watch('visible', () => {
                    const allVisible = groupLayer.layers?.every(l => l.visible) ?? false;
                    setLocalState(prev => ({
                        ...prev,
                        selectAllChecked: allVisible
                    }));
                });
                childWatchers.push(childHandle);
            });
        }

        return () => {
            visibilityHandle.remove();
            opacityHandle.remove();
            childWatchers.forEach(handle => handle.remove());
        };
    }, [currentLayer, ensureParentsVisible]);

    const updateLayer = useCallback((updateFn: (layer: __esri.Layer) => void) => {
        if (currentLayer) {
            updateFn(currentLayer);
        }
    }, [currentLayer]);

    const handleGroupLayerVisibilityToggle = useCallback((newVisibility: boolean) => {
        if (currentLayer?.type === 'group') {
            const groupLayer = currentLayer as __esri.GroupLayer;
            if (groupLayer.visible !== newVisibility) {
                groupLayer.visible = newVisibility;
                setGroupLayerVisibility(prev => ({ ...prev, [groupLayer.id]: newVisibility }));
            }
        }
    }, [currentLayer, setGroupLayerVisibility]);

    const handleToggleAll = useCallback((checked: boolean) => {
        if (currentLayer?.type === 'group') {
            const groupLayer = currentLayer as __esri.GroupLayer;
            groupLayer.layers?.forEach(childLayer => {
                if (childLayer.visible !== checked) {
                    childLayer.visible = checked;
                }
            });

            if (checked && !groupLayer.visible) {
                if (!groupLayer.visible) {
                    groupLayer.visible = true;
                    setGroupLayerVisibility(prev => ({ ...prev, [groupLayer.id]: true }));
                }
            }
        }
    }, [currentLayer, setGroupLayerVisibility]);

    const handleChildLayerToggle = useCallback((childLayer: __esri.Layer, checked: boolean, groupLayerProp: __esri.GroupLayer) => {
        const groupToEnsure = (currentLayer?.id === groupLayerProp.id && currentLayer?.type === 'group')
            ? currentLayer as __esri.GroupLayer
            : groupLayerProp;

        if (childLayer.visible !== checked) {
            childLayer.visible = checked;
        }

        if (checked && !groupToEnsure.visible) {
            if (!groupToEnsure.visible) {
                groupToEnsure.visible = true;
                setGroupLayerVisibility(prev => ({ ...prev, [groupToEnsure.id]: true }));
            }
        }
    }, [currentLayer, setGroupLayerVisibility]);


    const handleGroupVisibilityToggle = useCallback((checked: boolean) => {
        if (currentLayer) {
            if (currentLayer.visible !== checked) {
                currentLayer.visible = checked;
                setGroupLayerVisibility(prev => ({ ...prev, [currentLayer.id]: checked }));
            }
        }
    }, [currentLayer, setGroupLayerVisibility]);

    return {
        currentLayer,
        layerVisibility,
        layerOpacity,
        updateLayer,
        handleGroupLayerVisibilityToggle,
        groupLayerVisibility: groupLayerVisibility, // This is the context state
        activeGroupVisibility: localState.groupVisibility, // Specific to this hook's layer if it's a group
        selectAllChildren: localState.selectAllChecked, // Specific to this hook's layer if it's a group
        handleToggleAll,
        handleChildLayerToggle,
        handleGroupVisibilityToggle,
        // localState, // Exposing specific parts is often cleaner
        accordionTriggerRef
    };
};

export { useLayerVisibilityManager };