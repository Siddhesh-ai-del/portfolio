// Test configuration — deliberately separate from vite.config.ts so the app
// build never picks up test-only settings. jsdom provides the DOM (the app
// targets the browser, so no SSR env), and setup.ts patches the browser APIs
// jsdom lacks (matchMedia, requestIdleCallback) that components touch at
// lazy-init time.
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    // NOTE: no `restoreMocks` — setup.ts's console.error spy is created once
    // per file; a global restore would strip it between tests.
    clearMocks: true,
  },
});
