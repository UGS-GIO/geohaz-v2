import { createLazyFileRoute } from '@tanstack/react-router'
import Map from '@/pages/wetlandplants'

export const Route = createLazyFileRoute('/wetlandplants/')({
  component: () => <Map />,
})
