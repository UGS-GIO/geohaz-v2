import { createLazyFileRoute } from '@tanstack/react-router'
import Map from '@/pages/geophysics'

export const Route = createLazyFileRoute('/_map/geophysics/')({
  component: () => <Map />,
})
