import { createLazyFileRoute } from '@tanstack/react-router'
import Report from '../pages/report'

export const Route = createLazyFileRoute('/report')({
    component: () => <div><Report /></div>,
})
