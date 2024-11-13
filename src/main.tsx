import '@/index.css'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { Toaster } from '@/components/ui/toaster'
import { ThemeProvider } from '@/context/theme-provider'
import { MapProvider } from '@/context/map-provider'
import { SidebarProvider } from '@/context/sidebar-provider'
import { LayerListProvider } from '@/context/layerlist-provider'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
// Import the generated route tree
import { routeTree } from './routeTree.gen'

// Create a new router instance
const router = createRouter({ routeTree })

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
        <SidebarProvider>
          <LayerListProvider>
            <MapProvider>
              <RouterProvider router={router} />
              <Toaster />
            </MapProvider>
          </LayerListProvider>
        </SidebarProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </React.StrictMode >
)
