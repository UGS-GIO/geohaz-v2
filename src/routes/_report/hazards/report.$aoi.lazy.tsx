import { createLazyFileRoute } from '@tanstack/react-router'
import { HazardsReport } from '@/routes/_report/-components/hazards-report'

export const Route = createLazyFileRoute('/_report/hazards/report/$aoi')({
  component: HazardsReportRoute,
})

function HazardsReportRoute() {
  const { aoi } = Route.useParams()

  return <HazardsReport polygon={aoi} />
}