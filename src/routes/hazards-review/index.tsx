import Map from '@/pages/hazards'
import { createFileRoute } from '@tanstack/react-router'
import { useAuth } from '@/context/auth-provider'
import { signInWithOIDC } from '@/lib/auth'
import { useState } from 'react'

function ProtectedHazardsReview() {
  const { user, loading, initialized } = useAuth();
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleLogin = async () => {
    if (isAuthenticating) return;
    
    setIsAuthenticating(true);
    try {
      console.log('Starting OIDC login...');
      await signInWithOIDC();
      console.log('OIDC login completed');
    } catch (error) {
      console.error('Login failed:', error);
      setIsAuthenticating(false);
    }
  };

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

  // Show login prompt if not authenticated
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md p-6">
          <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
          <p className="text-muted-foreground mb-6">
            You need to sign in with Utah ID to access the Hazards Review section.
          </p>
          <button
            onClick={handleLogin}
            disabled={isAuthenticating}
            className="bg-primary text-primary-foreground px-6 py-2 rounded-md hover:bg-primary/90 disabled:opacity-50"
          >
            {isAuthenticating ? 'Signing in...' : 'Sign in with Utah ID'}
          </button>
        </div>
      </div>
    );
  }

  // User is authenticated, render the Map
  console.log('User authenticated:', user.email);
  return <Map />;
}

export const Route = createFileRoute('/hazards-review/')({
  component: ProtectedHazardsReview,
})