import { 
  getAuth, 
  signInWithRedirect, 
  getRedirectResult, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  OAuthProvider,
  User
} from 'firebase/auth';

// Get the auth instance
export const auth = getAuth();

// Configure OIDC provider
const oidcProvider = new OAuthProvider('oidc.utahid');

oidcProvider.addScope('email');
// oidcProvider.addScope('profile');

export const signInWithOIDC = () => {
  return signInWithRedirect(auth, oidcProvider);
};

export const signOut = () => {
  return firebaseSignOut(auth);
};

export const handleRedirectResult = () => {
  return getRedirectResult(auth);
};

// Auth state observer
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};