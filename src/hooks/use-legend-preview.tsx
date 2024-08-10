import { useEffect, useState } from 'react';
import { RendererProps } from '@/lib/types/mapping-types';
import { RendererFactory } from '@/lib/legend/renderer-factory';

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
                const preview = await RendererFactory.createPreview(renderer);
                if (preview) {
                    previews.push(preview);
                }
            }
            return previews;
        };

        fetchLegendData();
    }, [layerId, url, getRenderer]);

    return { preview, isLoading, error };
};

export default useLegendPreview;
