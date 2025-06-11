import { createFileRoute } from '@tanstack/react-router';
import { zodValidator } from '@tanstack/zod-adapter';
import { z } from 'zod';

const ccusSpecificSearchSchema = z.object({
    core: z.enum(['yes', 'no', 'all']).optional().catch(undefined),
    formation: z.string().optional().catch(undefined),
});

export type CcusRouteSearch = z.infer<typeof ccusSpecificSearchSchema>;

export const Route = createFileRoute('/ccus/')({
    validateSearch: zodValidator(ccusSpecificSearchSchema),
});