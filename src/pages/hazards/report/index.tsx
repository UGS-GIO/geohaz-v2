import { useEffect } from 'react'
import ReportApp from '@/pages/hazards/report/report/ReportApp'
import { useTheme } from '@/context/theme-provider'
import { Route } from '@/routes/_report/hazards.report.$aoi.lazy'

export default function Report() {
    const { aoi } = Route.useParams()
    const { setOverrideTheme } = useTheme()

    // Force light theme for report page
    useEffect(() => {
        setOverrideTheme('light')
        return () => setOverrideTheme(null)
    }, [setOverrideTheme])

    return <ReportApp polygon={aoi} />
}