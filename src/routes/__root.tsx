import { createRootRoute, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';
import Sidebar from '@/components/sidebar';
import { useSidebar } from '@/hooks/use-sidebar';

// Create a React component to use hooks properly.
const RootComponent = () => {
    const { isCollapsed } = useSidebar();

    return (
        <>
            <div className="relative h-full overflow-hidden bg-background">
                <Sidebar />
                <main
                    id="content"
                    className={`overflow-x-hidden pt-16 transition-[margin] md:overflow-y-hidden md:pt-0 ${isCollapsed ? 'md:ml-14' : 'md:ml-[36rem]'
                        } h-full`}
                >
                    <Outlet />
                </main>
            </div>
            <TanStackRouterDevtools />
        </>
    );
};

// Pass the named React component to the route.
export const Route = createRootRoute({
    component: RootComponent,
});
