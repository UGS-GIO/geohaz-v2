import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import Map from '@/pages/carbonstorage';

const ccsSearchSchema = z.object({});

export const Route = createFileRoute('/_map/carbonstorage/')({
    component: () => <Map />,
    validateSearch: ccsSearchSchema,
});