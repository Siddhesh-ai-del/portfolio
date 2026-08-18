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
      <LiquidBackground />
      <Nav />
      <main>
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