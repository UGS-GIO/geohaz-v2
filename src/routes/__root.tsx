import { TanStackRouterDevtools } from '@tanstack/router-devtools';
import { createRootRoute, Outlet } from '@tanstack/react-router';
import { z } from 'zod';
import { LayerUrlProvider } from '@/context/layer-url-provider';

const RootComponent = () => {
    return (
        <LayerUrlProvider>
            <Outlet />
            {import.meta.env.MODE !== 'production' && <TanStackRouterDevtools />}
        </LayerUrlProvider>
    );
};

const rootSearchSchema = z.object({
    zoom: z.coerce.number().optional(),
    lat: z.coerce.number().optional(),
    lon: z.coerce.number().optional(),
    filters: z.record(z.string()).optional(),
    coordinate_format: z.enum(['dd', 'dms']).optional(),
    layers: z.preprocess((val) => {
        if (typeof val === 'string') {
            try { return JSON.parse(val); } catch (e) { return undefined; }
        }
        return val;
    }, z.object({
        selected: z.array(z.string()).optional(),
        hidden: z.array(z.string()).optional(),
    }).optional())
}).strip();

export type RootSearch = z.infer<typeof rootSearchSchema>;

export const Route = createRootRoute({
    component: RootComponent,
    validateSearch: rootSearchSchema,
});