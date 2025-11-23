
import React, { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { EffectComposer, Bloom, ChromaticAberration, Noise, Vignette } from '@react-three/postprocessing';
import { Vector3 } from 'three';
import Brain from './Brain';
import { Section } from '../constants';

// Fix for missing R3F type definitions
declare global {
  namespace JSX {
    interface IntrinsicElements {
      ambientLight: any;
      pointLight: any;
    }
  }
  namespace React {
    namespace JSX {
      interface IntrinsicElements {
        ambientLight: any;
        pointLight: any;
      }
    }
  }
}

interface ExperienceProps {
  activeSection: Section;
}

const Experience: React.FC<ExperienceProps> = ({ activeSection }) => {
  const { camera } = useThree();
  const targetPosition = useRef(new Vector3(0, 0, 6)); 
  const lookAtPosition = useRef(new Vector3(0, 0, 0));

  // Camera orchestration based on section
  useEffect(() => {
    switch (activeSection) {
      case Section.INTRO:
        targetPosition.current.set(0, 0, 6); 
        lookAtPosition.current.set(0, 0, 0);
        break;
      case Section.ABOUT:
        targetPosition.current.set(4, 1, 4); // Angled view
        lookAtPosition.current.set(0, 0, 0);
        break;
      case Section.PROJECTS:
        targetPosition.current.set(-3, -2, 5); // Low angle
        lookAtPosition.current.set(0, 1, 0);
        break;
      case Section.CONTACT:
        targetPosition.current.set(0, 0, 8); // Zoom out
        lookAtPosition.current.set(0, 0, 0);
        break;
    }
  }, [activeSection]);

  useFrame((state) => {
    // Smooth camera transition
    state.camera.position.lerp(targetPosition.current, 0.04);
    state.camera.lookAt(lookAtPosition.current);
  });

  return (
    <>
      <color attach="background" args={['#000000']} />
      
      {/* Lighting is important for the shader Fresnel effect */}
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#00f3ff" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#bd00ff" />
      
      {/* Brain Visualization */}
      <Brain />

      {/* Post Processing Pipeline */}
      <EffectComposer disableNormalPass>
        {/* Bloom: Soft glow for the organic tissue feel */}
        <Bloom 
            intensity={1.0} 
            luminanceThreshold={0.2} 
            radius={0.5} 
        />
        
        {/* Chromatic Aberration: Glitchy tech feel */}
        <ChromaticAberration offset={[new Vector3(0.002, 0.002, 0)]} />
        
        {/* Noise: Film grain */}
        <Noise opacity={0.15} />
        
        {/* Vignette: Focus on center */}
        <Vignette eskil={false} offset={0.1} darkness={1.1} />
      </EffectComposer>
    </>
  );
};

export default Experience;
