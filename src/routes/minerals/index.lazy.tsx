import { createLazyFileRoute } from '@tanstack/react-router'
import Map from '@/pages/minerals'

export const Route = createLazyFileRoute('/minerals/')({
  component: () => <Map />,
})
