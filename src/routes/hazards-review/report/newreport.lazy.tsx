import NewReport from '@/pages/hazards/report/newreport'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/hazards-review/report/newreport')({
    component: () => (
        <div>
            <NewReport />
        </div>
    ),
})