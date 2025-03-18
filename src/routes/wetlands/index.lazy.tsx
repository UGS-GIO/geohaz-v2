import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/wetlands/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/wetlands/"!</div>
}
