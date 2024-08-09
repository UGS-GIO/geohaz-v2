import { useEffect, useState } from 'react';
import * as symbolUtils from "@arcgis/core/symbols/support/symbolUtils.js";
import { MapImageLayerRenderer, RegularLayerRenderer, RendererProps } from '@/lib/types/mapping-types';

const useLegendPreview = (
    layerId: string,
    url: string,
    getRenderer: (id: string, url: string) => Promise<RendererProps | undefined>
) => {
    const [preview, setPreview] = useState<{ html: HTMLElement, label: string, title: string }[] | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const fetchLegendData = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const data = await getRenderer(layerId, url);
                if (data) {
                    const previews = await generatePreviews(data);
                    setPreview(previews);
                } else {
                    setPreview(null);
                }
            } catch (err) {
                setError(err as Error);
                setPreview(null);
            } finally {
                setIsLoading(false);
            }
        };

        const generatePreviews = async (rendererData: RendererProps) => {
            const previews = [];
            for (const renderer of [...rendererData.MapImageLayerRenderer, ...rendererData.RegularLayerRenderer]) {
                const preview = await generatePreview(renderer);
                if (preview) {
                    previews.push(preview);
                }
            }
            return previews;
        };

        const generatePreview = async (rendererData: MapImageLayerRenderer | RegularLayerRenderer) => {
            let html: HTMLElement | null = null;
            let title = '';
            const label = rendererData.label;

            if ('renderer' in rendererData) {
                html = await symbolUtils.renderPreviewHTML(rendererData.renderer);
            } else if ('imageData' in rendererData) {
                title = rendererData.title;
                const imgHTML = `<img src="data:image/png;base64,${rendererData.imageData}" alt="${label}" />`;
                const range = document.createRange();
                const fragment = range.createContextualFragment(imgHTML);
                html = fragment.firstChild as HTMLElement;
            }

            if (html) {
                return { html, label, title };
            }
            return null;
        };

        fetchLegendData();
    }, [layerId, url, getRenderer]);

    return { preview, isLoading, error };
};

export default useLegendPreview;
