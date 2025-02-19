import { LayerListContext } from "@/context/layerlist-provider";
import { MapContext } from "@/context/map-provider";
import { findLayerById } from "@/lib/mapping-utils";
import { useContext, useState, useEffect, useCallback, useRef, RefObject } from "react";

const useLayerVisibilityManager = (layer: __esri.Layer) => {
    const { activeLayers } = useContext(MapContext);
    const { groupLayerVisibility, setGroupLayerVisibility } = useContext(LayerListContext);
    const [currentLayer, setCurrentLayer] = useState<__esri.Layer>();
    const [layerVisibility, setLayerVisibility] = useState<boolean>(layer.visible);
    const [layerOpacity, setLayerOpacity] = useState<number>(layer.opacity || 1);
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

    const handleGroupLayerVisibilityToggle = useCallback((newVisibility: boolean, accordionTriggerRef?: RefObject<HTMLButtonElement>) => {

        if (currentLayer?.type === 'group') {
            const groupLayer = currentLayer as __esri.GroupLayer;
            groupLayer.visible = newVisibility;

            setGroupLayerVisibility(prev => ({
                ...prev,
                [groupLayer.id]: newVisibility
            }));

            if (accordionTriggerRef) {
                const accordionState = accordionTriggerRef.current?.getAttribute('data-state');
                if (accordionState === 'closed' && newVisibility === true) { // open the accordion if it's closed
                    accordionTriggerRef.current?.click();
                }
                if (accordionState === 'open' && !groupLayer.layers?.some(layer => layer.visible) && newVisibility === false) { // close the accordion if it's open and no child layers are visible
                    accordionTriggerRef.current?.click();
                }
            }
        }
    }, [currentLayer, setGroupLayerVisibility]);

    const handleToggleAll = useCallback((checked: boolean) => {
        if (currentLayer?.type === 'group') {
            const groupLayer = currentLayer as __esri.GroupLayer;
            // Only update child layers' visibility, but not the group visibility
            groupLayer.layers?.forEach(childLayer => {
                childLayer.visible = checked;
            });

            // Update select all state without modifying group visibility
            setLocalState(prev => ({
                ...prev,
                selectAllChecked: checked // Only update select all state
            }));
        }
    }, [currentLayer]);

    const handleChildLayerToggle = (childLayer: __esri.Layer, checked: boolean, layer: __esri.GroupLayer
    ) => {
        childLayer.visible = checked;

        // If any child layer is being turned on, ensure group layer is also on
        if (checked) {
            handleGroupLayerVisibilityToggle(true);
            setLocalState(() => ({
                selectAllChecked: layer.layers?.every(layer => layer.visible) ?? false,
                groupVisibility: true
            }));
        } else {
            // If a child layer is being turned off, only update select all state
            setLocalState(prev => ({
                ...prev,
                selectAllChecked: false
            }));
        }
    };

    const handleGroupVisibilityToggle = (checked: boolean) => {
        setLocalState(prev => ({ ...prev, groupVisibility: checked }));
        handleGroupLayerVisibilityToggle(checked, accordionTriggerRef);
    };

    return {
        currentLayer,
        layerVisibility,
        layerOpacity,
        updateLayer,
        handleGroupLayerVisibilityToggle,
        groupLayerVisibility,
        handleToggleAll,
        handleChildLayerToggle,
        handleGroupVisibilityToggle,
        localState,
        accordionTriggerRef
    };
};

export { useLayerVisibilityManager };