import { createLazyFileRoute } from '@tanstack/react-router'
import Map from '@/pages/mineral_resources'

export const Route = createLazyFileRoute('/mineral_resources/')({
  component: () => <Map />,
})
