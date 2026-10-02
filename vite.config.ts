import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id: string) => {
          if (!id.includes('node_modules')) return;
          // react/react-dom/scheduler get their own chunk so app/vendor
          // changes don't invalidate the React runtime cache entry.
          if (
            id.includes('/react/') ||
            id.includes('/react-dom/') ||
            id.includes('/scheduler/')
          ) {
            return 'react';
          }
          return 'vendor';
        },
      },
    },
  },
})