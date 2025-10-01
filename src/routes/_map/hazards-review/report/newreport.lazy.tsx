import NewReport from '@/pages/hazards/report/newreport'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_map/hazards-review/report/newreport')({
    component: () => (
        <div>
            <NewReport />
        </div>
    ),
})