import { createLazyFileRoute } from '@tanstack/react-router'
import Map from '@/pages/wetlands'

export const Route = createLazyFileRoute('/_map/wetlands/')({
  component: () => <Map />,
})
