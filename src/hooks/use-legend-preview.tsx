import { useEffect, useState } from 'react';
import * as symbolUtils from "@arcgis/core/symbols/support/symbolUtils.js";
import { MapImageLayerRenderer, RegularLayerRenderer, RendererProps } from '@/lib/types/mapping-types';

const useLegendPreview = (layerId: string, url: string, getRenderer: (id: string, url: string) => Promise<RendererProps | undefined>) => {
    const [preview, setPreview] = useState<{ html: HTMLElement, label: string, title: string }[]>();
    const [legendData, setLegendData] = useState<RendererProps | undefined>();
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const fetchLegendData = async () => {
            try {
                console.log("Fetching legend data for layerId:", layerId);
                setIsLoading(true);
                const data = await getRenderer(layerId, url);
                console.log("Fetched legend data:", data);
                setLegendData(data);
            } catch (err) {
                console.error("Error fetching legend data:", err);
                setError(err as Error);
            } finally {
                setIsLoading(false);
                console.log("Fetching complete, loading state:", isLoading);
            }
        };

        fetchLegendData();
    }, [layerId, url, getRenderer]);

    useEffect(() => {
        const generatePreview = async (rendererData: MapImageLayerRenderer | RegularLayerRenderer) => {
            console.log("Generating preview for rendererData:", rendererData);
            let html: HTMLElement | null = null;
            let title = '';
            const label = rendererData.label;

            if ('renderer' in rendererData) {
                console.log("Renderer found, generating HTML preview.");
                html = await symbolUtils.renderPreviewHTML(rendererData.renderer);
            } else if ('imageData' in rendererData) {
                console.log("Image data found, creating image HTML.");
                title = rendererData.title;
                const imgHTML = `<img src="data:image/png;base64,${rendererData.imageData}" alt="${label}" />`;
                const range = document.createRange();
                const fragment = range.createContextualFragment(imgHTML);
                html = fragment.firstChild as HTMLElement;
            }

            if (html) {
                console.log("Preview generated successfully.");
                return { html, label, title };
            } else {
                console.log("Failed to generate preview.");
            }
            return null;
        };

        const generateAllPreviews = async () => {
            if (legendData) {
                console.log("Generating previews for all renderers.");
                const allRenderers = [...legendData.MapImageLayerRenderer, ...legendData.RegularLayerRenderer];
                const previews = [];
                for (let sublayerIndex = 0; sublayerIndex < allRenderers.length; sublayerIndex++) {
                    const rendererData = allRenderers[sublayerIndex];
                    console.log(`Processing sublayer index: ${sublayerIndex}`);
                    const preview = await generatePreview(rendererData);
                    if (preview) {
                        previews.push(preview);
                        console.log("Preview added:", preview);
                    }
                }
                setPreview(previews);
                console.log("All previews generated:", previews);
            } else {
                console.log("No legend data available to generate previews.");
            }
        };
        generateAllPreviews();
    }, [legendData]);

    console.log("Return state - preview:", preview, "isLoading:", isLoading, "error:", error);

    return { preview, isLoading, error };
};

export default useLegendPreview;
