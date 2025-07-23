import Map from '@/pages/hazards'
import { createFileRoute } from '@tanstack/react-router'
import { useAuth } from '@/context/auth-provider'
import { signInWithOIDC } from '@/lib/auth'
import { useEffect } from 'react'

function ProtectedHazardsReview() {
  const { user, loading, initialized } = useAuth();

  useEffect(() => {
    // Only check auth after initialization is complete
    if (initialized && !loading && !user) {
      // User is not authenticated, redirect to OIDC
      signInWithOIDC();
    }
  }, [user, loading, initialized]);

  // Show loading while checking auth
  if (!initialized || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if not authenticated (redirect is happening)
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p>Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // User is authenticated, render the Map
  return <Map />;
}

export const Route = createFileRoute('/hazards-review/')({
  component: ProtectedHazardsReview,
})