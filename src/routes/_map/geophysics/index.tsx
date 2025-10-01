import { createFileRoute } from '@tanstack/react-router'
import Map from '@/pages/geophysics'

export const Route = createFileRoute('/_map/geophysics/')({
  component: () => <Map />,
})
