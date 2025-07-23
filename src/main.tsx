import '@/index.css'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { Toaster } from '@/components/ui/toaster'
import { ThemeProvider } from '@/context/theme-provider'
import { MapProvider } from '@/context/map-provider'
import { SidebarProvider } from '@/context/sidebar-provider'
import { AuthProvider } from '@/context/auth-provider' // ADD THIS LINE
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { initializeApp } from 'firebase/app'
import { getAnalytics } from 'firebase/analytics'
import { logEvent } from 'firebase/analytics';

// Import the generated route tree
import { routeTree } from './routeTree.gen'

// Create a new router instance
const router = createRouter({ routeTree })

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAk9zQ6zDuLFAxhJCXCklNOiBVQQFo1CD8",
  authDomain: "ut-dnr-ugs-maps-prod.firebaseapp.com",
  projectId: "ut-dnr-ugs-maps-prod",
  storageBucket: "ut-dnr-ugs-maps-prod.firebasestorage.app",
  messagingSenderId: "328621131372",
  appId: "1:328621131372:web:be0e38a400bb831f79fa49",
  measurementId: "G-4HPYLDS1SS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
logEvent(analytics, 'app_initialized');

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme='dark' storageKey='vite-ui-theme'>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <SidebarProvider>
            <MapProvider>
              <RouterProvider router={router} />
              <Toaster />
            </MapProvider>
          </SidebarProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </React.StrictMode>
)