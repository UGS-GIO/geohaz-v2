import { auth, signInWithOIDC } from '@/lib/auth';

export const requireAuth = async () => {
  return new Promise<void>((resolve, reject) => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      unsubscribe(); // Clean up listener
      if (user) {
        resolve();
      } else {
        // User is not authenticated, redirect to OIDC
        signInWithOIDC().catch(reject);
        reject(new Error('Authentication required'));
      }
    });
  });
};