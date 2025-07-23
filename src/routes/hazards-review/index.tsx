import Map from '@/pages/hazards'
import { createFileRoute } from '@tanstack/react-router'
import { requireAuth } from '@/lib/route-auth'

export const Route = createFileRoute('/hazards-review/')({
  beforeLoad: requireAuth,
  component: () => <Map />,
})