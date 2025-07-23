import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithRedirect, 
  getRedirectResult, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  OAuthProvider,
  User
} from 'firebase/auth';

// Firebase configuration - moved from main.tsx
const firebaseConfig = {
  apiKey: "AIzaSyAk9zQ6zDuLFAxhJCXCklNOiBVQQFo1CD8",
  authDomain: "ut-dnr-ugs-maps-prod.firebaseapp.com",
  projectId: "ut-dnr-ugs-maps-prod",
  storageBucket: "ut-dnr-ugs-maps-prod.firebasestorage.app",
  messagingSenderId: "328621131372",
  appId: "1:328621131372:web:be0e38a400bb831f79fa49",
  measurementId: "G-RXN0523RE5" // Updated to match server
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Get the auth instance
export const auth = getAuth(app);

// Configure OIDC provider
const oidcProvider = new OAuthProvider('oidc.utahid');

// Optional: Configure additional scopes if needed
// oidcProvider.addScope('email');
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