// Application entry point — the only file Vite loads as the bundle root.
// Responsibilities: import global styles once, resolve the mount node, and
// render the React tree. StrictMode stays on so double-invoked effects expose
// missing cleanups during development (production builds strip its warnings).
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// `!` asserts the element exists; index.html guarantees a #root div, so a null
// check here would be unreachable noise — a missing #root is a template bug.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
