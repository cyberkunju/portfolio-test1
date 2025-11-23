import React, { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Loader } from '@react-three/drei';
import Experience from './components/Experience';
import Overlay from './components/Overlay';
import { Section, CONTENT } from './constants';

// Fix for missing R3F type definitions
declare global {
  namespace JSX {
    interface IntrinsicElements {
      color: any;
    }
  }
  namespace React {
    namespace JSX {
      interface IntrinsicElements {
        color: any;
      }
    }
  }
}

const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState<Section>(Section.INTRO);

  return (
    <div className="relative w-full h-full bg-black">
      {/* R3F Canvas Layer */}
      <div className="absolute inset-0 z-0">
        <Canvas
          dpr={[1, 2]}
          camera={{ position: [0, 0, 6], fov: 45, near: 0.1, far: 100 }}
          gl={{ antialias: false, alpha: false, stencil: false, depth: true }}
        >
          <color attach="background" args={['#020203']} />
          <Suspense fallback={null}>
            <Experience activeSection={activeSection} />
          </Suspense>
        </Canvas>
      </div>

      {/* HTML Overlay Layer */}
      <Overlay activeSection={activeSection} onNavigate={setActiveSection} />
      
      {/* Custom Loader */}
      <Loader 
        dataInterpolation={(p) => `${CONTENT.loading[Math.floor((p / 100) * (CONTENT.loading.length - 1))]}`}
        containerStyles={{ backgroundColor: '#000' }}
        innerStyles={{ width: '200px', height: '2px', backgroundColor: '#222' }}
        barStyles={{ height: '2px', backgroundColor: '#00f3ff' }}
        dataStyles={{ fontFamily: '"Share Tech Mono", monospace', color: '#00f3ff', fontSize: '12px' }}
      />
    </div>
  );
};

export default App;