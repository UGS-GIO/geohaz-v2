import { createLazyFileRoute } from '@tanstack/react-router'
import Map from '@/pages/ccus'

export const Route = createLazyFileRoute('/ccus')({
    component: () => <Map />,
})
