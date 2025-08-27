import { createLazyFileRoute } from '@tanstack/react-router'
import Map from '@/pages/ccs'

export const Route = createLazyFileRoute('/ccs/')({
  component: () => <Map />,
})
