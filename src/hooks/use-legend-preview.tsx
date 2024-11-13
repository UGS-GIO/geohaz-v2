import { useQuery } from '@tanstack/react-query';
import { RendererFactory } from '@/lib/legend/renderer-factory';
import { getRenderer } from '@/lib/mapping-utils'; // Assumes getRenderer returns a single renderer
import { MapContext } from '@/context/map-provider';
import { useContext } from 'react';

const useLegendPreview = (layerId: string, url: string) => {
    const { view } = useContext(MapContext);

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
                renderers.map(async (r) => {
                    try {
                        const preview = await RendererFactory.createPreview(r);
                        return preview; // Return individual preview if successful
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
        queryKey: ['legendPreview', layerId, url], // Query key
        queryFn: fetchLegendData,
        enabled: !!view, // Only run the query when the view
        staleTime: 1000 * 60 * 60 * 1, // Cache for 1 hours
    });

    return { preview, isLoading, error };
};

export default useLegendPreview;
