import { createFileRoute, Outlet } from '@tanstack/react-router'
import { z } from 'zod'

// This layout only accepts redirectTo, blocking all root params
const authSearchSchema = z.object({
    redirectTo: z.string().optional(),
})

export const Route = createFileRoute('/_auth')({
    validateSearch: authSearchSchema,
    component: () => <Outlet />,
})