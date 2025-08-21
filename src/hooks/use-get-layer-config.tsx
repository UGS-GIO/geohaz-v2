import { useState, useEffect, useMemo } from "react";
import { LayerProps } from "@/lib/types/mapping-types";
import { useGetCurrentPage } from "./use-get-current-page";

export interface LayerOrderConfig {
    layerName: string;
    position: 'start' | 'end' | number;
}

// Function to find a layer by name in a nested structure
export const findLayerByName = (layers: LayerProps[], name: string): { layer: LayerProps; parent: LayerProps[] | null } | null => {
    for (const layer of layers) {
        if (layer.title === name) {
            return { layer, parent: layers };
        }

        // Check in group layers
        if ('layers' in layer && Array.isArray(layer.layers)) {
            const result = findLayerByName(layer.layers, name);
            if (result) return result;
        }
    }
    return null;
};

const useGetLayerConfig = (layerOrderConfigs?: LayerOrderConfig[]) => {
    const currentPage = useGetCurrentPage();
    const [layerConfig, setLayerConfig] = useState<LayerProps[] | null>(null);

    // Memoize the layerOrderConfigs to prevent unnecessary re-renders
    const memoizedLayerOrderConfigs = useMemo(() => layerOrderConfigs, [JSON.stringify(layerOrderConfigs)]);

    useEffect(() => {
        const loadConfig = async () => {

            // Check if currentPage is empty, if so, set layerConfig to null to avoid loading any configuration
            if (currentPage === '') return setLayerConfig(null);

            try {
                const config = await import(`@/pages/${currentPage}/data/layers.tsx`);
                let processedConfig = [...config.default];

                // If we have layer order configurations, process them
                if (memoizedLayerOrderConfigs && memoizedLayerOrderConfigs.length > 0) {
                    const layersToReorder = new Map<string, { layer: LayerProps; parent: LayerProps[] | null }>();

                    // First, find and remove all layers that need to be reordered
                    memoizedLayerOrderConfigs.forEach(config => {
                        const result = findLayerByName(processedConfig, config.layerName);
                        if (result) {
                            layersToReorder.set(config.layerName, result);
                            if (result.parent) {
                                const index = result.parent.indexOf(result.layer);
                                if (index !== -1) {
                                    result.parent.splice(index, 1);
                                }
                            }
                        }
                    });

                    // Then, insert layers at their specified positions in the root config
                    memoizedLayerOrderConfigs.forEach(orderConfig => {
                        const layerInfo = layersToReorder.get(orderConfig.layerName);
                        if (layerInfo) {
                            if (orderConfig.position === 'start') {
                                processedConfig.unshift(layerInfo.layer);
                            } else if (orderConfig.position === 'end') {
                                processedConfig.push(layerInfo.layer);
                            } else if (typeof orderConfig.position === 'number') {
                                const insertIndex = Math.min(
                                    Math.max(0, orderConfig.position),
                                    processedConfig.length
                                );
                                processedConfig.splice(insertIndex, 0, layerInfo.layer);
                            }
                        }
                    });
                }

                setLayerConfig(processedConfig);
            } catch (error) {
                console.error('Error loading layer configuration:', error);
                setLayerConfig(null);
            }
        };

        loadConfig();
    }, [currentPage, memoizedLayerOrderConfigs]);

    return layerConfig;
};

export { useGetLayerConfig };
