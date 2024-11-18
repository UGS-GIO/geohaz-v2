import { createLazyFileRoute } from '@tanstack/react-router'
import Map from '@/pages/ccus/page'

export const Route = createLazyFileRoute('/ccus')({
    component: () => <Map />,
})
