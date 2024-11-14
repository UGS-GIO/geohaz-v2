import HazardMap from '@/pages/hazards'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/hazards')({
  component: () => <HazardMap />,
})
