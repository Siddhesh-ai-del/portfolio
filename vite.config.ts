// Vite build configuration — React plugin + manual chunking. Kept minimal on
// purpose: everything else (Tailwind/autoprefixer) runs through PostCSS.
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // Manual code-splitting: app code stays in index-*.js, node_modules
        // goes to vendor-*.js, and the React runtime gets its own chunk.
        // Only files under node_modules are routed here — `undefined` return
        // lets Rollup use its default grouping for first-party code.
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