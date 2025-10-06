import { createLazyFileRoute } from '@tanstack/react-router'
import Map from '@/pages/hazards-review'

export const Route = createLazyFileRoute('/_map/hazards-review/')({
    component: () => <Map />,
})