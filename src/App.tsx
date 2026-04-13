import { useState, useCallback, lazy, Suspense } from 'react';
import { WaterErrorBoundary } from './components/water/WaterErrorBoundary';
import WaterCanvas from './components/water/WaterCanvas';
import Nav from './components/layout/Nav';
import Hero from './components/sections/Hero';
import ProcessSection from './components/sections/ProcessSection';
import ShowcaseSection from './components/sections/ShowcaseSection';
import CTASection from './components/sections/CTASection';
import Footer from './components/layout/Footer';

const Configurator = lazy(() => import('./components/configurator/Configurator'));

export default function App() {
  const [configOpen, setConfigOpen] = useState(false);
  const openConfig = useCallback(() => setConfigOpen(true), []);

  return (
    <>
      <WaterErrorBoundary>
        <WaterCanvas />
      </WaterErrorBoundary>
      <Nav onConfigure={openConfig} />
      <Hero onStart={openConfig} />
      <ProcessSection />
      <ShowcaseSection />
      <CTASection onStart={openConfig} />
      <Footer />
      <Suspense fallback={null}>
        <Configurator open={configOpen} onClose={() => setConfigOpen(false)} />
      </Suspense>
    </>
  );
}
