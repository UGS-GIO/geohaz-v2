import '@/index.css'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { ThemeProvider } from '@/context/theme-provider'
import router from '@/router'
import { MapProvider } from '@/context/map-provider'
import { SidebarProvider } from '@/context/sidebar-provider'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SidebarProvider>
      <ThemeProvider defaultTheme='dark' storageKey='vite-ui-theme'>
        <MapProvider>
          <RouterProvider router={router} />
          <Toaster />
        </MapProvider>
      </ThemeProvider>
    </SidebarProvider>
  </React.StrictMode >
)
