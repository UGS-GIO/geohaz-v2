import { useContext, useEffect, useState, useCallback } from 'react';
import { RendererProps } from '@/lib/types/mapping-types';
import { RendererFactory } from '@/lib/legend/renderer-factory';
import { getRenderers } from '@/lib/mapping-utils';
import { MapContext } from '@/context/map-provider';

const useLegendPreview = (layerId: string, url: string) => {
    const [preview, setPreview] = useState<{ html: HTMLElement, label: string, title: string }[] | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);
    const { view } = useContext(MapContext);

    // Fetch renderers and map image renderers
    const fetchRenderers = useCallback(async () => {
        if (!view || !view.map) return { renderers: [], mapImageRenderers: [] };

        const { renderers, mapImageRenderers } = await getRenderers(view, view.map as __esri.Map);
        return { renderers, mapImageRenderers };
    }, [view]);

    // Filter Regular Layer Renderer by ID
    const filterRegularLayerRenderer = useCallback((renderers: any[], id: string) => {
        return renderers.filter(renderer => renderer.id === id);
    }, []);

    // Filter Map Image Layer Renderer by URL
    const filterMapImageLayerRenderer = useCallback((mapImageRenderers: any[], url: string) => {
        return mapImageRenderers.filter(renderer => renderer.url === url);
    }, []);

    // Get Renderer data by ID and URL
    const getRenderer = useCallback(async (id: string, url: string): Promise<RendererProps | undefined> => {
        const { renderers, mapImageRenderers } = await fetchRenderers();

        if (!renderers || !mapImageRenderers) return;

        const RegularLayerRenderer = filterRegularLayerRenderer(renderers, id);
        const MapImageLayerRenderer = filterMapImageLayerRenderer(mapImageRenderers, url);

        return {
            MapImageLayerRenderer,
            RegularLayerRenderer,
        };
    }, [fetchRenderers, filterRegularLayerRenderer, filterMapImageLayerRenderer]);

    // Fetch and process legend data
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
                    setPreview([]);
                }
            } catch (err) {
                setError(err as Error);
                setPreview([]);
            } finally {
                setIsLoading(false);
            }
        };

        const generatePreviews = async (rendererData: RendererProps) => {
            const allRenderers = [...rendererData.MapImageLayerRenderer, ...rendererData.RegularLayerRenderer];
            const previews = await Promise.all(
                allRenderers.map(async (renderer) => {
                    try {
                        const preview = await RendererFactory.createPreview(renderer);
                        return preview;
                    } catch (error) {
                        console.error('Error generating preview:', error);
                        return null;
                    }
                })
            );
            return previews.filter(Boolean) as { html: HTMLElement, label: string, title: string }[]; // Ensure the return type matches the state type
        };

        fetchLegendData();
    }, [layerId, url, getRenderer]);

    return { preview, isLoading, error };
};

export default useLegendPreview;
