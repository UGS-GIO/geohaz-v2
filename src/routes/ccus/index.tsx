// src/routes/ccus/index.tsx

import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { wellWithTopsWMSTitle } from '@/pages/ccus/data/layers';

const ccusSearchSchema = z.object({
    core: z.enum(['yes', 'no']).optional(),
    formation: z.string().optional(),
    filters: z.record(z.string()).optional(),
});

export const Route = createFileRoute('/ccus/')({
    validateSearch: (search: Record<string, unknown>): z.infer<typeof ccusSearchSchema> & { layers?: string[] } => {
        // Parse the simple UI params from the incoming URL.
        const { core, formation } = ccusSearchSchema.pick({ core: true, formation: true }).parse(search);

        // Also parse any existing global params we might interact with.
        const currentLayers = z.array(z.string()).optional().parse(search.layers);
        const currentFilters = ccusSearchSchema.shape.filters.parse(search.filters);

        const newFilters = { ...currentFilters };
        const newLayersSet = new Set(currentLayers);

        // Build the filter string from the simple UI params.
        const wellFilterParts: string[] = [];
        if (core === "yes") wellFilterParts.push(`hascore = 'True'`);
        if (core === "no") wellFilterParts.push(`hascore = 'False'`);
        if (formation) wellFilterParts.push(`${formation} IS NOT NULL`);

        const combinedWellFilter = wellFilterParts.length > 0 ? wellFilterParts.join(' AND ') : null;

        // Sync both the filter object AND the layers array.
        if (combinedWellFilter) {
            newFilters[wellWithTopsWMSTitle] = combinedWellFilter;
            // If the filter is active, ensure the layer is visible.
            newLayersSet.add(wellWithTopsWMSTitle);
        } else {
            delete newFilters[wellWithTopsWMSTitle];
        }

        // Return the complete, synchronized search object.
        return {
            core,
            formation,
            filters: Object.keys(newFilters).length > 0 ? newFilters : undefined,
            layers: Array.from(newLayersSet),
        };
    },
});