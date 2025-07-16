import { LayerUrlProvider } from '@/context/layer-url-provider';
import { createRootRoute, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';
import { zodValidator } from '@tanstack/zod-adapter'
import { z } from 'zod';

const RootComponent = () => {
    return (
        <LayerUrlProvider>
            <Outlet />
            {import.meta.env.MODE !== 'production' && <TanStackRouterDevtools />}
        </LayerUrlProvider>
    );
};

const rootSearchSchema = z.object({
    zoom: z.coerce.number().optional().catch(undefined),
    lat: z.coerce.number().optional().catch(undefined),
    lon: z.coerce.number().optional().catch(undefined),
    coordinate_format: z.enum(['dd', 'dms']).optional().catch(undefined),
    layers: z.array(z.string()).optional(),
    filters: z.record(z.string()).optional(),
}).catchall(z.unknown());

export type RootSearch = z.infer<typeof rootSearchSchema>;

export const Route = createRootRoute({
    component: RootComponent,
    validateSearch: zodValidator(rootSearchSchema),
});
