import { createLazyFileRoute } from '@tanstack/react-router'
import Report from '@/pages/hazards/report'

export const Route = createLazyFileRoute('/_report/hazards/report/$aoi')({
    component: Report
})