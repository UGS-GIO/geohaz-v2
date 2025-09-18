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

const useGetLayerConfigs = (layerOrderConfigs?: LayerOrderConfig[]) => {
    const currentPage = useGetCurrentPage();
    const [layerConfigs, setLayerConfigs] = useState<LayerProps[] | null>(null);

    // Memoize the layerOrderConfigs to prevent unnecessary re-renders
    const memoizedLayerOrderConfigs = useMemo(() => layerOrderConfigs, [JSON.stringify(layerOrderConfigs)]);

    useEffect(() => {
        const loadConfigs = async () => {
            // Check if currentPage is empty, if so, set layerConfigs to null
            if (currentPage === '') return setLayerConfigs(null);

            try {
                // Get all layer config file paths for the current page
                const layerConfigPaths = import.meta.glob(`@/pages/*/data/layers/*.tsx`);
                const currentPagePaths = Object.keys(layerConfigPaths).filter(path =>
                    path.includes(`/pages/${currentPage}/data/layers/`)
                );

                // Also check for the main layers.tsx file
                const mainLayersPath = `@/pages/${currentPage}/data/layers.tsx`;

                let allConfigs: LayerProps[] = [];

                // Try to load the main layers.tsx file first
                try {
                    const mainConfig = await import(`@/pages/${currentPage}/data/layers.tsx`) as { default: LayerProps[] };
                    if (mainConfig.default && Array.isArray(mainConfig.default)) {
                        allConfigs.push(...mainConfig.default);
                    }
                } catch (error) {
                    // Main layers.tsx doesn't exist, that's fine
                    console.debug(`No main layers.tsx found for ${currentPage}`);
                }

                // Load all additional layer config files
                for (const path of currentPagePaths) {
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
        };

        loadConfigs();
    }, [currentPage, memoizedLayerOrderConfigs]);

    return layerConfigs;
};

export { useGetLayerConfigs };