// Root composition — the entire single-page portfolio in section order.
// No router and no state: the page is one scroll document, so App's only job
// is to stack the sections and keep <main> as the single landmark for the
// content between nav and footer (accessibility, skip-link targeting).

import Nav from './components/Nav';
import Hero from './components/Hero';
import Focus from './components/Focus';
import Systems from './components/Systems';
import Research from './components/Research';
import Stack from './components/Stack';
import Certifications from './components/Certifications';
import Footer from './components/Footer';
import LiquidBackground from './components/LiquidBackground';

export default function App() {
  return (
    <>
      {/* Fixed, negative-z layers: LiquidBackground must be a sibling rendered
          BEFORE <main> so its z-[-3]/[-2]/[-1] stack stays behind every
          section without any of those sections needing to create a stacking
          context of their own. pointer-events-none keeps it click-through. */}
      <LiquidBackground />
      <Nav />
      <main>
        {/* Reading order == DOM order == visual order; each section is a
            self-contained block with its own id used by Nav scroll-spy. */}
        <Hero />
        <Focus />
        <Systems />
        <Research />
        <Stack />
        <Certifications />
      </main>
      <Footer />
    </>
  );
}
