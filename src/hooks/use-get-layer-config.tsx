import { useState, useEffect } from "react";
import { LayerProps } from "@/lib/types/mapping-types";
import { useGetCurrentPage } from "./use-get-current-page";

const useGetLayerConfig = () => {
    const currentPage = useGetCurrentPage()
    const [layerConfig, setLayerConfig] = useState<LayerProps[] | null>(null)

    useEffect(() => {
        const loadConfig = async () => {
            try {
                // Dynamically import the config file based on the page
                const config = await import(`@/pages/${currentPage}/data/layers.tsx`)
                setLayerConfig(config.default);
            } catch (error) {
                console.error('Error loading layer configuration:', error)
                setLayerConfig(null);
            }
        };

        loadConfig();
    }, [currentPage]);

    return layerConfig;
};

export { useGetLayerConfig };