import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/hazards/report/newreport/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/hazards/report/newreport/"!</div>
}
