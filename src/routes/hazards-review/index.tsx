import Map from '@/pages/hazards-review'
import { createFileRoute } from '@tanstack/react-router'
import { useAuth } from '@/context/auth-provider'
import { signInWithOIDC, signOut } from '@/lib/auth'
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
      console.log('Starting OIDC popup login...');
      const result = await signInWithOIDC();
      console.log('Login successful:', result.user.email);
      // User state will be updated automatically via the auth state listener
    } catch (error: unknown) {
      console.error('Login failed:', error);
      
      // Handle specific error cases
      if (error && typeof error === 'object' && 'code' in error) {
        const authError = error as { code: string; message: string };
        if (authError.code === 'auth/popup-closed-by-user') {
          setAuthError('Login was cancelled. Please try again.');
        } else if (authError.code === 'auth/popup-blocked') {
          setAuthError('Popup was blocked by your browser. Please allow popups and try again.');
        } else {
          setAuthError(`Login failed: ${authError.message || 'Unknown error'}`);
        }
      } else {
        setAuthError('Login failed: Unknown error occurred');
      }
      
      setIsAuthenticating(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      console.log('Logout successful');
    } catch (error: unknown) {
      console.error('Logout failed:', error);
    }
  };

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
            className="bg-orange-500 text-white px-6 py-2 rounded-md hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAuthenticating ? 'Signing in...' : 'Sign in with Utah ID'}
          </button>
          
          <div className="mt-4 text-xs text-muted-foreground">
            <p>This will open a popup window for authentication.</p>
            <p>Please ensure popups are enabled for this site.</p>
          </div>
        </div>
      </div>
    );
  }

  console.log('User authenticated:', user.email);
  
  return (
    <div className="relative">
      {/* Optional: Add a logout button somewhere visible */}
      <div className="absolute top-4 right-4 z-50">
        <div className="bg-white/90 backdrop-blur-sm rounded-md p-2 shadow-sm">
          <span className="text-sm text-gray-600 mr-2">
            Signed in as: {user.email}
          </span>
          <button
            onClick={handleLogout}
            className="text-sm bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
          >
            Sign Out
          </button>
        </div>
      </div>
      <Map />
    </div>
  );
}

export const Route = createFileRoute('/hazards-review/')({
  component: ProtectedHazardsReview,
});