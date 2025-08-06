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
import proj4 from 'proj4'

// Import the generated route tree
import { routeTree } from './routeTree.gen'

proj4.defs("EPSG:26912", "+proj=utm +zone=12 +ellps=GRS80 +datum=NAD83 +units=m +no_defs");
proj4.defs("EPSG:4326", "+proj=longlat +datum=WGS84 +no_defs");

// Create a new router instance
const router = createRouter({ routeTree })

// Initialize Firebase Analytics
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