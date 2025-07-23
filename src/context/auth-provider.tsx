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
    // Handle redirect result first
    handleRedirectResult()
      .then((result) => {
        if (result) {
          setUser(result.user);
        }
      })
      .catch((error) => {
        console.error('Error handling redirect result:', error);
      })
      .finally(() => {
        setInitialized(true);
      });

    // Set up auth state listener
    const unsubscribe = onAuthStateChange((user) => {
      setUser(user);
      if (initialized) {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [initialized]);

  // Only stop loading once we've handled redirect result and have initial auth state
  useEffect(() => {
    if (initialized && user !== undefined) {
      setLoading(false);
    }
  }, [initialized, user]);

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