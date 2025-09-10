import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { wellWithTopsWMSTitle } from '@/pages/carbonstorage/data/layers';
import Map from '@/pages/carbonstorage';

// ## 1. Define the Zod schemas for validation
const ccsSimpleSearchSchema = z.object({
    core: z.enum(['yes', 'no']).optional(),
    las: z.enum(['yes', 'no']).optional(),
    formations: z.string().optional(),
    formation_operator: z.enum(['and']).optional(),
    coordinate_format: z.enum(['dd', 'dms']).optional(),
});

const ccsComplexSearchSchema = z.object({
    filters: z.record(z.string()).optional(),
    layers: z.object({
        selected: z.array(z.string()).optional().default([]),
        hidden: z.array(z.string()).optional().default([]),
    }).optional().default({}),
});

const ccsSearchSchema = ccsSimpleSearchSchema.merge(ccsComplexSearchSchema);

type CcsSearchParams = z.infer<typeof ccsSearchSchema>;

// ## 2. Encapsulate business logic in a dedicated function
const synchronizeAndBuildWellFilters = (search: CcsSearchParams): CcsSearchParams => {
    const newFilters = { ...(search.filters || {}) };
    const newSelectedSet = new Set(search.layers.selected);
    let { core, las, formations, formation_operator } = search;

    // Rule 1: If the Wells layer is not selected, its filters must be cleared.
    if (!newSelectedSet.has(wellWithTopsWMSTitle)) {
        core = undefined;
        las = undefined;
        formations = undefined;
        formation_operator = undefined;
    }

    const formationArray = formations ? formations.split(',').filter(Boolean) : [];
    const wellFilterParts: string[] = [];

    // Build CQL filter parts from simple params
    if (core === "yes") wellFilterParts.push(`hascore = 'True'`);
    if (core === "no") wellFilterParts.push(`hascore = 'False'`);
    if (las === "yes") wellFilterParts.push(`has_las = 'True'`);
    if (las === "no") wellFilterParts.push(`has_las = 'False'`);

    if (formationArray.length > 0) {
        const operator = formation_operator === 'and' ? ' AND ' : ' OR ';
        const formationFilter = formationArray.map(f => `${f} IS NOT NULL`).join(operator);
        wellFilterParts.push(formationArray.length > 1 ? `(${formationFilter})` : formationFilter);
    }

    const combinedWellFilter = wellFilterParts.join(' AND ');

    if (combinedWellFilter) {
        newFilters[wellWithTopsWMSTitle] = combinedWellFilter;
        newSelectedSet.add(wellWithTopsWMSTitle);
    } else {
        delete newFilters[wellWithTopsWMSTitle];
    }

    return {
        ...search,
        core,
        las,
        formations,
        formation_operator,
        filters: Object.keys(newFilters).length > 0 ? newFilters : undefined,
        layers: {
            ...search.layers,
            selected: Array.from(newSelectedSet),
        }
    };
};

export const Route = createFileRoute('/carbonstorage/')({
    component: () => <Map />,
    validateSearch: (search: Record<string, unknown>) => {
        const parsedSearch = ccsSearchSchema.parse(search);
        const synchronizedSearch = synchronizeAndBuildWellFilters(parsedSearch);
        return synchronizedSearch;
    },
});