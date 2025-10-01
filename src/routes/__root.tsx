import { TanStackRouterDevtools } from '@tanstack/router-devtools';
import { createRootRoute, Outlet } from '@tanstack/react-router';
import { z } from 'zod';

const RootComponent = () => {
    return (
        <>
            <Outlet />
            {import.meta.env.MODE !== 'production' && <TanStackRouterDevtools />}
        </>
    );
};

const rootSearchSchema = z.object({});

export const Route = createRootRoute({
    component: RootComponent,
    validateSearch: rootSearchSchema,
});