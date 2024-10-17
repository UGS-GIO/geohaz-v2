import '@/index.css'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { ThemeProvider } from '@/context/theme-provider'
import router from '@/router'
import { MapProvider } from '@/context/map-provider'
import { SidebarProvider } from '@/context/sidebar-provider'
import { LayerListProvider } from '@/context/layerlist-provider'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

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
