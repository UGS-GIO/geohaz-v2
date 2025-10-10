import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_report/hazards')({
  component: () => <Outlet />,
})