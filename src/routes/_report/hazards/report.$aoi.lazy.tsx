// src/routes/_report/hazards/report.$aoi.lazy.tsx
import { createLazyFileRoute } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useTheme } from '@/context/theme-provider'
import { HazardsReport } from '@/routes/_report/-components/HazardsReport'

export const Route = createLazyFileRoute('/_report/hazards/report/$aoi')({
  component: HazardsReportRoute,
})

function HazardsReportRoute() {
  const { aoi } = Route.useParams()
  const { setOverrideTheme } = useTheme()

  useEffect(() => {
    setOverrideTheme('light')
    return () => setOverrideTheme(null)
  }, [setOverrideTheme])

  return <HazardsReport polygon={aoi} />
}