// Vite build configuration — React plugin + manual chunking. Kept minimal on
// purpose: everything else (Tailwind/autoprefixer) runs through PostCSS.
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Multi-page app: every HTML file is an entry, so Vite emits each of them
// into dist/ and rewrites its script tag to the hashed bundle. index.html is
// the home page; the other three are the section pages the bottom pill links
// to (each declares its section via <body data-section> and loads
// src/section.tsx). Relative URLs below keep this working regardless of where
// the config is resolved from.
const htmlEntry = (file: string) => fileURLToPath(new URL(file, import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: htmlEntry('index.html'),
        hackathons: htmlEntry('hackathons.html'),
        events: htmlEntry('events.html'),
        posts: htmlEntry('posts.html'),
      },
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