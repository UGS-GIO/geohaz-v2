import { createLazyFileRoute } from '@tanstack/react-router'
import Map from '@/pages/carbonstorage'

export const Route = createLazyFileRoute('/carbonstorage/')({
  component: () => <Map />,
})
