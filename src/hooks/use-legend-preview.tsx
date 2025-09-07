import { useQuery } from '@tanstack/react-query';
import { RendererFactory } from '@/lib/legend/renderer-factory';
import { getRenderer } from '@/lib/legend/utils';
import { MapImageLayerRenderer, RegularLayerRenderer } from '@/lib/types/mapping-types';
import { useMap } from '@/hooks/use-map';

const useLegendPreview = (layerId: string, url: string) => {
    const { view } = useMap();

    const fetchLegendData = async () => {
        if (!view || !view.map) return [];

        try {
            // Fetch the renderer(s) for the given layer ID
            const renderer = await getRenderer(view, view.map, layerId);

            if (!renderer) {
                console.warn(`Renderer not found for layer ID: ${layerId}`);
                return [];
            }

            // Ensure renderer is handled as an array (for multiple WMS rules or other cases)
            const renderers = Array.isArray(renderer) ? renderer : [renderer];

            // Generate previews for all renderers
            const previews = await Promise.all(
                renderers.map(async (rendererItem) => {
                    try {
                        // Skip null or undefined renderers
                        if (!rendererItem) {
                            console.warn('Skipping null or undefined renderer');
                            return null;
                        }

                        // Check renderer type directly
                        if (rendererItem.type !== 'map-image-renderer' && rendererItem.type !== 'regular-layer-renderer') {
                            console.warn(`Unsupported renderer type: ${rendererItem.type}`);
                            return null;
                        }

                        // At this point TypeScript should recognize rendererItem as one of the two valid types
                        const preview = await RendererFactory.createPreview(rendererItem as MapImageLayerRenderer | RegularLayerRenderer);
                        return preview;
                    } catch (err) {
                        console.error('Error generating preview:', err);
                        return null; // Return null on error to filter out later
                    }
                })
            );

            // Filter out any failed previews (null values)
            return previews.filter(Boolean);
        } catch (error) {
            console.error('Error fetching legend data:', error);
            return [];
        }
    };

    // Query with dependencies: view, layerId, and url (for caching and refetch logic)
    const { data: preview = [], isLoading, error } = useQuery({
        queryKey: ['legendPreview', layerId, url],
        queryFn: fetchLegendData,
        enabled: !!view, // Only run the query when the view is available
        staleTime: 1000 * 60 * 60 * 1, // Cache for 1 hour
    });

    return { preview, isLoading, error };
};

export default useLegendPreview;