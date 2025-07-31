import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { wellWithTopsWMSTitle } from '@/pages/ccus/data/layers'; // Import the layer title constant

// Add the 'filters' property to the schema definition
const ccusSpecificSearchSchema = z.object({
    core: z.enum(['yes', 'no']).optional(),
    formation: z.string().optional(),
    filters: z.record(z.string()).optional(),
});

export const Route = createFileRoute('/ccus/')({
    validateSearch: (search: Record<string, unknown>): z.infer<typeof ccusSpecificSearchSchema> => {
        const { core, formation } = ccusSpecificSearchSchema.pick({ core: true, formation: true }).parse(search);

        // Start with any manually provided filters (for power users).
        const currentFilters = (search.filters && typeof search.filters === 'object') ? search.filters as Record<string, string> : {};
        const newFilters = { ...currentFilters };

        // Build the filter string from the simple UI params.
        const wellFilterParts: string[] = [];
        if (core === "yes") wellFilterParts.push(`hascore = 'True'`);
        if (core === "no") wellFilterParts.push(`hascore = 'False'`);
        if (formation) wellFilterParts.push(`${formation} IS NOT NULL`);

        const combinedWellFilter = wellFilterParts.length > 0 ? wellFilterParts.join(' AND ') : null;

        // Overwrite the filter for the wells layer, ensuring UI controls win.
        if (combinedWellFilter) {
            newFilters[wellWithTopsWMSTitle] = combinedWellFilter;
        } else {
            delete newFilters[wellWithTopsWMSTitle];
        }

        // Return the complete, synchronized search object.
        return {
            core,
            formation,
            filters: Object.keys(newFilters).length > 0 ? newFilters : undefined,
        };
    },
});