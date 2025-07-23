// context/auth-provider.tsx
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { onAuthStateChange, handleRedirectResult } from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔥 AuthProvider: Starting - URL:', window.location.href);
    console.log('🔥 AuthProvider: URL search params:', window.location.search);
    console.log('🔥 AuthProvider: URL hash:', window.location.hash);

    let mounted = true;

    // Check for redirect result immediately
    console.log('🔥 AuthProvider: Calling handleRedirectResult...');
    handleRedirectResult()
      .then((result) => {
        console.log('🔥 AuthProvider: handleRedirectResult completed');
        console.log('🔥 AuthProvider: Result:', result);
        
        if (mounted && result) {
          console.log('🔥 AuthProvider: Found user in redirect result!');
          console.log('🔥 AuthProvider: User email:', result.user.email);
          console.log('🔥 AuthProvider: User UID:', result.user.uid);
          setUser(result.user);
        } else {
          console.log('🔥 AuthProvider: No redirect result found');
        }
      })
      .catch((error) => {
        console.error('🔥 AuthProvider: handleRedirectResult ERROR:', error);
      })
      .finally(() => {
        console.log('🔥 AuthProvider: Setting loading to false');
        if (mounted) {
          setLoading(false);
        }
      });

    // Set up auth state listener
    const unsubscribe = onAuthStateChange((user) => {
      if (mounted) {
        console.log('🔥 AuthProvider: onAuthStateChange triggered');
        console.log('🔥 AuthProvider: User from listener:', user?.email || 'no user');
        setUser(user);
      }
    });

    return () => {
      console.log('🔥 AuthProvider: Cleanup');
      mounted = false;
      unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  return context;
}