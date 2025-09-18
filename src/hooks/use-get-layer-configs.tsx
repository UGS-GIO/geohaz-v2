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

// Function to apply layer reordering based on configurations
const applyLayerOrdering = (layers: LayerProps[], orderConfigs: LayerOrderConfig[]): LayerProps[] => {
    if (!orderConfigs || orderConfigs.length === 0) return layers;

    let processedConfig = [...layers];
    const layersToReorder = new Map<string, { layer: LayerProps; parent: LayerProps[] | null }>();

    // First, find and remove all layers that need to be reordered
    orderConfigs.forEach(config => {
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
    orderConfigs.forEach(orderConfig => {
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

    return processedConfig;
};

const useGetLayerConfigs = (pageName?: string, layerOrderConfigs?: LayerOrderConfig[]) => {
    const currentPage = useGetCurrentPage();
    const [layerConfigs, setLayerConfigs] = useState<LayerProps[] | null>(null);

    // Memoize the layerOrderConfigs to prevent unnecessary re-renders
    const memoizedLayerOrderConfigs = useMemo(() => layerOrderConfigs, [JSON.stringify(layerOrderConfigs)]);

    useEffect(() => {
        const loadConfigs = async () => {
            if (pageName) {
                // Single config workflow - load specific config from current page
                if (currentPage === '') return setLayerConfigs(null);

                try {
                    const config = await import(`@/pages/${currentPage}/data/layers/${pageName}.tsx`) as { default: LayerProps[] };
                    if (config.default && Array.isArray(config.default)) {

                        // Apply layer ordering if specified
                        const processedConfigs = applyLayerOrdering(config.default, memoizedLayerOrderConfigs || []);
                        setLayerConfigs(processedConfigs);
                    } else {
                        setLayerConfigs(null);
                    }
                } catch (error) {
                    console.error(`Error loading layer configuration ${pageName}:`, error);
                    setLayerConfigs(null);
                }
            } else {
                // Get all configs workflow - use glob to find and load all configs
                try {
                    const layerConfigPaths = import.meta.glob(`@/pages/*/data/layers/*.tsx`);
                    let allConfigs: LayerProps[] = [];

                    // Load all layer config files
                    for (const path of Object.keys(layerConfigPaths)) {
                        try {
                            const config = await layerConfigPaths[path]() as { default: LayerProps[] };
                            if (config.default && Array.isArray(config.default)) {
                                allConfigs.push(...config.default);
                            }
                        } catch (error) {
                            console.warn(`Failed to load layer config from ${path}:`, error);
                        }
                    }


                    // Apply layer ordering if specified
                    const processedConfigs = applyLayerOrdering(allConfigs, memoizedLayerOrderConfigs || []);
                    setLayerConfigs(processedConfigs.length > 0 ? processedConfigs : null);
                } catch (error) {
                    console.error('Error loading layer configurations:', error);
                    setLayerConfigs(null);
                }
            }
        };

        loadConfigs();
    }, [pageName, currentPage, memoizedLayerOrderConfigs]);

    return layerConfigs;
};

export { useGetLayerConfigs };