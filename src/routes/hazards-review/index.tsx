import Map from '@/pages/hazards-review'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { auth } from '@/lib/auth'
import { z } from 'zod';

const hazardsReviewSearchSchema = z.object({
  coordinate_format: z.enum(['dd', 'dms']).optional(),
});

function HazardsReviewPage() {
  return <Map />
}

export const Route = createFileRoute('/hazards-review/')({
  beforeLoad: async ({ location }) => {
    // Wait for auth to initialize
    await new Promise<void>((resolve) => {
      const unsubscribe = auth.onAuthStateChanged(() => {
        unsubscribe()
        resolve()
      })
    })

    // Check if user is authenticated
    if (!auth.currentUser) {
      throw redirect({
        to: '/login',
        search: {
          redirectTo: location.href,
        },
      })
    }
  },
  validateSearch: hazardsReviewSearchSchema,
  component: HazardsReviewPage,
})