import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_report')({
    component: RouteComponent,
})

function RouteComponent() {
    return <Outlet />
}