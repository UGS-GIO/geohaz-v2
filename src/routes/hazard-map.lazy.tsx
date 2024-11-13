import HazardMap from '@/pages/dashboard'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/hazard-map')({
  component: () => <HazardMap />,
})
