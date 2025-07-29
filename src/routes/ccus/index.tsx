import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { wellWithTopsWMSTitle } from '@/pages/ccus/data/layers';
import Map from '@/pages/ccus';

const ccusSearchSchema = z.object({
    core: z.enum(['yes', 'no']).optional(),
    formation: z.string().optional(),
    filters: z.record(z.string()).optional(),
}).strip();

export const Route = createFileRoute('/ccus/')({
    component: () => <Map />,
    validateSearch: (search: Record<string, unknown>) => {
        // Zod first strips unknown params, then we parse and process the result.
        const { core, formation, filters } = ccusSearchSchema.parse(search);

        const layers = z.object({
            selected: z.array(z.string()).optional(),
            hidden: z.array(z.string()).optional(),
        }).optional().parse(search.layers);

        const newSelectedSet = new Set(layers?.selected);
        const newFilters = { ...filters };

        // Build the filter string from the UI params.
        const wellFilterParts: string[] = [];
        if (core === "yes") wellFilterParts.push(`hascore = 'True'`);
        if (core === "no") wellFilterParts.push(`hascore = 'False'`);
        if (formation) wellFilterParts.push(`${formation} IS NOT NULL`);

        const combinedWellFilter = wellFilterParts.length > 0 ? wellFilterParts.join(' AND ') : null;

        if (combinedWellFilter) {
            newFilters[wellWithTopsWMSTitle] = combinedWellFilter;
        } else {
            delete newFilters[wellWithTopsWMSTitle];
        }

        return {
            core,
            formation,
            filters: Object.keys(newFilters).length > 0 ? newFilters : undefined,
            layers: {
                ...layers,
                selected: Array.from(newSelectedSet),
            }
        };
    },
});