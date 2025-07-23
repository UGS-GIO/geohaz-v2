import '@/index.css'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { Toaster } from '@/components/ui/toaster'
import { ThemeProvider } from '@/context/theme-provider'
import { MapProvider } from '@/context/map-provider'
import { SidebarProvider } from '@/context/sidebar-provider'
import { AuthProvider } from '@/context/auth-provider'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { getAnalytics } from 'firebase/analytics'
import { logEvent } from 'firebase/analytics';

// Import the generated route tree
import { routeTree } from './routeTree.gen'

// Create a new router instance
const router = createRouter({ routeTree })

// Initialize Firebase Analytics (auth is now handled in lib/auth.ts)
// Note: Only initialize analytics if you need it, otherwise you can remove this
let analytics;
try {
  analytics = getAnalytics();
  logEvent(analytics, 'app_initialized');
} catch (error) {
  console.warn('Analytics not available:', error);
}

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