/// <reference types="vite/client" />
/// <reference types="vitest" />

import path from "path"
import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vitest/config';

// https://vitejs.dev/config/
export default defineConfig((props) => ({
  plugins: [react()],
  publicDir: 'public/',
  build: {
    outDir: 'dist/',
  },
  esbuild: {
    treeShaking: true,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    css: true,
    setupFiles: './src/test/setup.ts',
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
