import { createFileRoute } from '@tanstack/react-router'
import Map from '@/pages/geophysics'

export const Route = createFileRoute('/geophysics/')({
  component: () => <Map />,
})
