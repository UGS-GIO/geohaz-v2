import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { wellWithTopsWMSTitle } from '@/pages/ccs/data/layers';
import Map from '@/pages/ccs';

const ccsSearchSchema = z.object({
    core: z.enum(['yes', 'no']).optional(),
    formations: z.string().optional(),
    formation_operator: z.enum(['and']).optional(), // 'and' explicitly set, undefined defaults to 'or'
    coordinate_format: z.enum(['dd', 'dms']).optional(),
    filters: z.record(z.string()).optional(),
}).strip();

export const Route = createFileRoute('/ccs/')({
    component: () => <Map />,
    validateSearch: (search: Record<string, unknown>) => {
        let { core, formations, formation_operator, coordinate_format, filters } = ccsSearchSchema.parse(search);

        const layers = z.object({
            selected: z.array(z.string()).optional(),
            hidden: z.array(z.string()).optional(),
        }).optional().parse(search.layers);

        const newSelectedSet = new Set(layers?.selected);
        const newFilters = { ...filters };

        // Rule 1: If the Wells Database layer is not selected, its filters must be cleared.
        if (!newSelectedSet.has(wellWithTopsWMSTitle)) {
            core = undefined;
            formations = undefined;
            formation_operator = undefined;
        }

        // Parse formations from comma-separated string
        const formationArray = formations ? formations.split(',').filter(Boolean) : [];

        // Build the filter string from the (now validated) UI params.
        const wellFilterParts: string[] = [];

        // Only add core filter if it's explicitly 'yes' or 'no'
        if (core === "yes") wellFilterParts.push(`hascore = 'True'`);
        if (core === "no") wellFilterParts.push(`hascore = 'False'`);

        // Build formation filter with configurable AND/OR logic for multiple formations
        if (formationArray.length > 0) {
            const useAndOperator = formation_operator === 'and';
            const operator = useAndOperator ? ' AND ' : ' OR ';
            const formationFilter = formationArray.map(formation => `${formation} IS NOT NULL`).join(operator);

            if (formationArray.length > 1) {
                wellFilterParts.push(`(${formationFilter})`);
            } else {
                wellFilterParts.push(formationFilter);
            }
        }

        const combinedWellFilter = wellFilterParts.length > 0 ? wellFilterParts.join(' AND ') : null;

        if (combinedWellFilter) {
            newFilters[wellWithTopsWMSTitle] = combinedWellFilter;
            // Rule 2: If a filter is active, ensure the layer is selected.
            newSelectedSet.add(wellWithTopsWMSTitle);
        } else {
            delete newFilters[wellWithTopsWMSTitle];
        }

        // Return the final, synchronized search object.
        return {
            core: core,
            formations,
            formation_operator,
            coordinate_format,
            filters: Object.keys(newFilters).length > 0 ? newFilters : undefined,
            layers: {
                ...layers,
                selected: Array.from(newSelectedSet),
            }
        };
    },
});

export type CCSSearch = z.infer<typeof ccsSearchSchema>