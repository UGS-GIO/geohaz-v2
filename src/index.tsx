import './index.css';
import '@esri/calcite-components/dist/calcite/calcite.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { defineCustomElements } from '@esri/calcite-components/dist/loader';
import { ThemeProvider } from './contexts/ThemeProvider';
import { MapProvider } from './contexts/MapProvider';


// Create a root element for the application
const root = createRoot(document.querySelector('#root') as HTMLElement);

const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false } },
});
// CDN hosted assets
defineCustomElements(window);

// Render the application
root.render(
  <StrictMode>
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <MapProvider>
          <App />
        </MapProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </StrictMode>
);
