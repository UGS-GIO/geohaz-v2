import { createRootRoute, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';

const RootComponent = () => {
    return (
        <>
            <Outlet />
            {import.meta.env.MODE !== 'production' && <TanStackRouterDevtools />}
        </>
    );
};

export const Route = createRootRoute({
    component: RootComponent,
});
