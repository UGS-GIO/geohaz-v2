import { useEffect } from 'react';
import { wellWithTopsWMSTitle } from '@/pages/carbonstorage/data/layers';
import { findAndApplyWMSFilter } from '@/pages/carbonstorage/components/sidebar/map-configurations/map-configurations';

interface UseDomainFiltersProps {
    view: __esri.MapView | __esri.SceneView | undefined;
    filters: Record<string, string> | undefined;
    updateLayerSelection: (title: string, selected: boolean) => void;
}

/**
 * Hook that handles domain-specific filter application for carbon storage layers.
 * Applies WMS filters from URL parameters to the map and updates layer selection state.
 * This is separated from generic URL sync to keep domain logic isolated.
 * 
 * @param view - ArcGIS map view instance
 * @param filters - Filter values from URL parameters  
 * @param updateLayerSelection - Function to update layer selection state
 */
export function useDomainFilters({ view, filters, updateLayerSelection }: UseDomainFiltersProps) {
    useEffect(() => {
        if (!view || !view.map) return;

        const filtersFromUrl = filters ?? {};
        const wellFilter = filtersFromUrl[wellWithTopsWMSTitle] || null;

        findAndApplyWMSFilter(view.map, wellWithTopsWMSTitle, wellFilter);

        if (wellFilter) {
            updateLayerSelection(wellWithTopsWMSTitle, true);
        }
    }, [view, filters, updateLayerSelection]);
}