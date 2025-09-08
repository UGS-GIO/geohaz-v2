import { useMemo } from 'react';
import { LayerProps } from '@/lib/types/mapping-types';

/**
 * Processes layer visibility based on selected layers and hidden groups.
 * A layer is visible if it is selected and not part of a hidden group.
 * @param layers - Array of layer configurations.
 * @param selectedLayerTitles - Set of titles of selected layers.
 * @param hiddenGroupTitles - Set of titles of hidden groups.
 * @return Processed array of layers with updated visibility.
 */
export function useLayerVisibility(
    layers: LayerProps[],
    selectedLayerTitles: Set<string>,
    hiddenGroupTitles: Set<string>
) {
    return useMemo(() => {
        const processLayers = (
            layerArray: LayerProps[],
            parentIsHidden: boolean
        ): LayerProps[] => {
            return layerArray.map(layer => {
                const isHiddenByGroup = parentIsHidden || hiddenGroupTitles.has(layer.title || '');

                if (layer.type === 'group' && 'layers' in layer) {
                    const newChildLayers = processLayers(layer.layers || [], isHiddenByGroup);
                    const isGroupEffectivelyVisible = newChildLayers.some(child => child.visible);
                    return { ...layer, visible: isGroupEffectivelyVisible, layers: newChildLayers };
                }

                // A layer is only visible if it's selected AND its group hierarchy is not hidden.
                const isVisible = selectedLayerTitles.has(layer.title || '') && !isHiddenByGroup;
                return { ...layer, visible: isVisible };
            });
        };

        return processLayers(layers, false);
    }, [layers, selectedLayerTitles, hiddenGroupTitles]);
}