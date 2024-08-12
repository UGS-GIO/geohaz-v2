import { useContext, useEffect, useState, useCallback } from 'react';
import { RendererProps } from '@/lib/types/mapping-types';
import { RendererFactory } from '@/lib/legend/renderer-factory';
import { getRenderers } from '@/lib/mapping-utils';
import { MapContext } from '@/context/map-provider';

const useLegendPreview = (
    layerId: string,
    url: string
) => {
    console.log('id', layerId);
    console.log('url', url);
    const [preview, setPreview] = useState<{ html: HTMLElement, label: string, title: string }[] | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);
    const { view } = useContext(MapContext);

    const fetchRenderers = useCallback(async (view: __esri.SceneView | __esri.MapView | undefined) => {
        if (!view || !view.map) return { renderers: [], mapImageRenderers: [] };

        const { renderers, mapImageRenderers } = await getRenderers(view, view.map as __esri.Map);
        console.log('renderers', renderers);
        console.log('mapImageRenderers', mapImageRenderers);

        return { renderers, mapImageRenderers };
    }, []);

    const filterRegularLayerRenderer = useCallback((renderers: any[], id: string) => {
        return renderers.filter(renderer => renderer.id === id);
    }, []);

    const filterMapImageLayerRenderer = useCallback((mapImageRenderers: any[], url: string) => {
        return mapImageRenderers.filter(renderer => renderer.url === url);
    }, []);

    const getRenderer = useCallback(async (id: string, url: string): Promise<RendererProps | undefined> => {
        const { renderers, mapImageRenderers } = await fetchRenderers(view);

        if (!renderers || !mapImageRenderers) return;

        console.log('renderers', renderers);


        const RegularLayerRenderer = filterRegularLayerRenderer(renderers, id);
        const MapImageLayerRenderer = filterMapImageLayerRenderer(mapImageRenderers, url);

        return {
            MapImageLayerRenderer,
            RegularLayerRenderer,
        };
    }, [view, fetchRenderers, filterRegularLayerRenderer, filterMapImageLayerRenderer]);

    useEffect(() => {
        const fetchLegendData = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const data = await getRenderer(layerId, url);
                console.log('Renderer data:', data); // Debugging line

                if (data) {
                    const previews = await generatePreviews(data);
                    console.log('Generated previews:', previews); // Debugging line
                    setPreview(previews);
                } else {
                    setPreview([]);
                }
            } catch (err) {
                console.error('Error fetching renderer:', err); // Debugging line
                setError(err as Error);
                setPreview([]);
            } finally {
                setIsLoading(false);
            }
        };

        const generatePreviews = async (rendererData: RendererProps) => {
            const allRenderers = [...rendererData.MapImageLayerRenderer, ...rendererData.RegularLayerRenderer];
            const previews = await Promise.all(
                allRenderers.map(renderer => RendererFactory.createPreview(renderer))
            );
            return previews.filter(Boolean); // Filter out any undefined/null previews
        };

        fetchLegendData();
    }, [layerId, url, getRenderer]);

    return { preview, isLoading, error };
};

export default useLegendPreview;
