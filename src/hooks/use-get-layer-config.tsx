import { useState, useEffect } from "react";
import { LayerProps } from "@/lib/types/mapping-types";
import { useGetCurrentPage } from "./use-get-current-page";

const useGetLayerConfig = () => {
    const currentPage = useGetCurrentPage();
    const [layerConfig, setLayerConfig] = useState<LayerProps[] | null>(null);

    useEffect(() => {
        const loadConfig = async () => {
            try {
                // Dynamically import the config file based on the page
                const config = await import(`@/pages/${currentPage}/data/layers.tsx`);

                // Reverse the main layers so the map displays them in the correct order
                const reversedConfig = [...config.default].reverse();

                // Reverse the child layers (if any) for same reason to display them in the correct order
                const reversedLayersWithChildren = reversedConfig.map(layer => {
                    if (layer.layers) {
                        // If the layer has a 'layers' property (child layers), reverse them as well
                        return {
                            ...layer,
                            layers: [...layer.layers].reverse()  // Reverse the child layers
                        };
                    } else if (layer.sublayers) {
                        // If it's a WMS or similar layer with 'sublayers', reverse them
                        return {
                            ...layer,
                            sublayers: [...layer.sublayers].reverse()  // Reverse the sublayers
                        };
                    }
                    return layer;
                });

                // Set the reversed config (both main layers and child layers)
                setLayerConfig(reversedLayersWithChildren);
            } catch (error) {
                console.error('Error loading layer configuration:', error);
                setLayerConfig(null);
            }
        };

        loadConfig();
    }, [currentPage]);

    return layerConfig;
};

export { useGetLayerConfig };