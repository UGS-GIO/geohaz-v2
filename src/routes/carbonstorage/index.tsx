import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import Map from '@/pages/carbonstorage';

const ccsSearchSchema = z.object({
    coordinate_format: z.enum(['dd', 'dms']).optional(),
    filters: z.record(z.string()).optional(),
    layers: z.object({
        selected: z.array(z.string()).optional().default([]),
        hidden: z.array(z.string()).optional().default([]),
    }).optional().default({}),
});

export type CcsSearchParams = z.infer<typeof ccsSearchSchema>;

export const Route = createFileRoute('/carbonstorage/')({
    component: () => <Map />,
    validateSearch: ccsSearchSchema,
});