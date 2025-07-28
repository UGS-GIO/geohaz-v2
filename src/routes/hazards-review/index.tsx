import Map from '@/pages/hazards-review'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { auth } from '@/lib/auth'

// Simple wrapper component that just renders the map
function HazardsReviewPage() {
  return <Map />
}

export const Route = createFileRoute('/hazards-review/')({
  beforeLoad: async ({ location }) => {
    // Wait for auth to initialize
    await new Promise<void>((resolve) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const unsubscribe = auth.onAuthStateChanged((user) => { // This user is scoped to the callback
        unsubscribe()
        resolve()
      })
    })

    // Check if user is authenticated
    if (!auth.currentUser) {
      throw redirect({
        to: '/login', // Remove trailing slash
        search: {
          redirectTo: location.href,
        },
      })
    }
  },
  component: HazardsReviewPage,
})