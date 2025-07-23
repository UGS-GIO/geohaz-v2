import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { onAuthStateChange, handleRedirectResult } from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  initialized: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    let mounted = true;

    // Handle redirect result first
    handleRedirectResult()
      .then((result) => {
        if (mounted) {
          if (result) {
            console.log('Redirect result:', result.user.email);
            setUser(result.user);
          }
          setInitialized(true);
        }
      })
      .catch((error) => {
        console.error('Error handling redirect result:', error);
        if (mounted) {
          setInitialized(true);
        }
      });

    // Set up auth state listener
    const unsubscribe = onAuthStateChange((user) => {
      if (mounted) {
        console.log('Auth state changed:', user?.email || 'no user');
        setUser(user);
        if (initialized) {
          setLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  // Only stop loading once we've handled redirect result and have initial auth state
  useEffect(() => {
    if (initialized) {
      setLoading(false);
    }
  }, [initialized]);

  return (
    <AuthContext.Provider value={{ user, loading, initialized }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}