import Map from '@/pages/hazards';
import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';

// REMOVED: The hardcoded list of layers is no longer needed.

const hazardsSearchSchema = z.object({
  review_data: z.enum(['yes', 'no']).optional(),
  layers: z.object({
    selected: z.array(z.string()).optional(),
    hidden: z.array(z.string()).optional(),
  }).optional(),
  // IMPORTANT: The filters object can contain filters for many different layers
  filters: z.record(z.string()).optional(),
}).strip();

export const Route = createFileRoute('/hazards/')({
  component: () => <Map />,
  validateSearch: (search) => {
    let { review_data, layers, filters } = hazardsSearchSchema.parse(search);

    // The new filters object we will build
    const newFilters = { ...filters };
    const selectedLayers = new Set(layers?.selected);

    // Determine the filter part for review_data
    const reviewDataFilterPart = review_data === 'yes'
      ? "is_current = 'R'"
      : review_data === 'no'
        ? "is_current <> 'R' OR is_current IS NULL"
        : null;

    // Get a list of all other active filters that are NOT the review_data filter
    const otherFilterParts = (filterString: string | undefined) => {
      if (!filterString) return [];
      return filterString.split(' AND ').filter(part => !part.includes('is_current'));
    };

    // Dynamically apply the filter to all selected layers
    selectedLayers.forEach(layerTitle => {
      // Get any existing filters for this layer (e.g., from another component)
      const existingParts = otherFilterParts(filters?.[layerTitle]);

      // Add our new review_data filter if it's active
      const allParts = reviewDataFilterPart
        ? [...existingParts, reviewDataFilterPart]
        : existingParts;

      if (allParts.length > 0) {
        newFilters[layerTitle] = allParts.join(' AND ');
      } else {
        // If no filters remain, remove the entry for this layer
        delete newFilters[layerTitle];
      }
    });

    return {
      review_data,
      filters: Object.keys(newFilters).length > 0 ? newFilters : undefined,
      layers: {
        ...layers,
        // No need to modify the selected layers here, as the filter applies to what's already visible
        selected: Array.from(selectedLayers),
      }
    };
  },
});