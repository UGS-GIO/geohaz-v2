import { useLocation } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { LayerProps } from "@/lib/types/mapping-types";

const useGetLayerConfig = () => {
    const location = useLocation();
    const page = location.pathname.split("/")[1];
    const [layerConfig, setLayerConfig] = useState<LayerProps[] | null>(null);

    useEffect(() => {
        const loadConfig = async () => {
            try {
                // Dynamically import the config file based on the page
                const config = await import(`@/pages/${page}/data/layers.tsx`);
                setLayerConfig(config.default);
            } catch (error) {
                console.error('Error loading layer configuration:', error);
                setLayerConfig(null);
            }
        };

        loadConfig();
    }, [page]);

    console.log('Layer Config:', layerConfig);

    return layerConfig;
};

export { useGetLayerConfig };