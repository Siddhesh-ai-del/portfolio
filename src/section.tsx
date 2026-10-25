// Section-page entry point — ONE shared bundle for the three section
// documents (hackathons.html, events.html, posts.html). Each of those files
// declares which section it is via <body data-section="…">, so the markup
// stays declarative and there is no third copy of this mount logic.
//
// Same StrictMode/main.tsx conventions as the home entry: the `!` asserts the
// mount node (index template guarantees #root), and an unknown data-section
// is a template bug worth failing loudly on — rendering the home page there
// would silently ship a broken URL.
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App, { type PageId } from './App.tsx';

const PAGES: readonly string[] = ['hackathons', 'events', 'posts'];
const section = document.body.dataset.section;

if (!section || !PAGES.includes(section)) {
  throw new Error(
    `section.tsx: <body data-section> must be one of ${PAGES.join(' | ')}, got ${JSON.stringify(section)}`
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App page={section as PageId} />
  </StrictMode>,
);
