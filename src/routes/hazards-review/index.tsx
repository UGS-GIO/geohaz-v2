// routes/hazards-review/index.tsx
import Map from '@/pages/hazards'
import { createFileRoute } from '@tanstack/react-router'
import { useAuth } from '@/context/auth-provider'
import { signInWithOIDC } from '@/lib/auth'
import { useState } from 'react'

function ProtectedHazardsReview() {
  const { user, loading } = useAuth();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (isAuthenticating) return;
    
    setIsAuthenticating(true);
    setAuthError(null);
    
    try {
      console.log('Starting OIDC redirect login...');
      // signInWithRedirect doesn't return a promise that resolves with user data
      // It redirects the page, so this will never complete in this session
      await signInWithOIDC();
    } catch (error: unknown) {
      console.error('Login failed:', error);
      setAuthError('Login failed');
      setIsAuthenticating(false);
    }
  };

  // Show loading while auth is initializing
  if (loading) {
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
          
          {authError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <strong>Error:</strong> {authError}
            </div>
          )}
          
          <button
            onClick={handleLogin}
            disabled={isAuthenticating}
            className="bg-orange-500 text-white px-6 py-2 rounded-md hover:bg-orange-600 disabled:opacity-50"
          >
            {isAuthenticating ? 'Redirecting...' : 'Sign in with Utah ID'}
          </button>
          
          <p className="text-xs text-muted-foreground mt-4">
            {/* @ts-expect-error - TypeScript is incorrectly inferring never type */}
            Debug: loading={loading.toString()}, user={user?.email || 'none'}
          </p>
        </div>
      </div>
    );
  }

  // User is authenticated
  console.log('User authenticated:', user.email);
  return <Map />;
}

// Export the Route - this is required for TanStack Router
export const Route = createFileRoute('/hazards-review/')({
  component: ProtectedHazardsReview,
})