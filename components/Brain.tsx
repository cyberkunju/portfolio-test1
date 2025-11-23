
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { shaderMaterial } from '@react-three/drei';
import { extend } from '@react-three/fiber';

// --------------------------------------------------------
// Brain Shader Material
// --------------------------------------------------------
// This shader mathematically sculpts a sphere into a brain shape
// by manipulating vertex positions (Vertex Shader) and 
// coloring based on depth (Fragment Shader).

const BrainMaterial = shaderMaterial(
  {
    uTime: 0,
    uColor: new THREE.Color('#bd00ff'), // Base Purple
    uRidgeColor: new THREE.Color('#00f3ff'), // Cyan Peaks
    uMouse: new THREE.Vector3(0, 0, 0),
  },
  // VERTEX SHADER
  `
    uniform float uTime;
    uniform vec3 uMouse;
    varying float vDisplacement;
    varying vec3 vNormal;
    varying vec3 vPosition;

    // GLSL Simplex Noise Function
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
    vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
    float snoise(vec3 v) {
      const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
      const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
      vec3 i  = floor(v + dot(v, C.yyy) );
      vec3 x0 = v - i + dot(i, C.xxx) ;
      vec3 g = step(x0.yzx, x0.xyz);
      vec3 l = 1.0 - g;
      vec3 i1 = min( g.xyz, l.zxy );
      vec3 i2 = max( g.xyz, l.zxy );
      vec3 x1 = x0 - i1 + C.xxx;
      vec3 x2 = x0 - i2 + C.yyy;
      vec3 x3 = x0 - D.yyy;
      i = mod289(i);
      vec4 p = permute( permute( permute(
                i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
              + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
              + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
      float n_ = 0.142857142857;
      vec3  ns = n_ * D.wyz - D.xzx;
      vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
      vec4 x_ = floor(j * ns.z);
      vec4 y_ = floor(j - 7.0 * x_ );
      vec4 x = x_ *ns.x + ns.yyyy;
      vec4 y = y_ *ns.x + ns.yyyy;
      vec4 h = 1.0 - abs(x) - abs(y);
      vec4 b0 = vec4( x.xy, y.xy );
      vec4 b1 = vec4( x.zw, y.zw );
      vec4 s0 = floor(b0)*2.0 + 1.0;
      vec4 s1 = floor(b1)*2.0 + 1.0;
      vec4 sh = -step(h, vec4(0.0));
      vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
      vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
      vec3 p0 = vec3(a0.xy,h.x);
      vec3 p1 = vec3(a0.zw,h.y);
      vec3 p2 = vec3(a1.xy,h.z);
      vec3 p3 = vec3(a1.zw,h.w);
      vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
      p0 *= norm.x;
      p1 *= norm.y;
      p2 *= norm.z;
      p3 *= norm.w;
      vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
      m = m * m;
      return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
    }

    void main() {
      vNormal = normal;
      vPosition = position;

      // 1. BASIC SHAPE: Elongate Sphere into Ellipsoid
      vec3 pos = position;
      pos.x *= 0.75; // Narrow width
      pos.z *= 1.2;  // Longer front-to-back

      // 2. NOISE LAYERS (The Folds/Gyri)
      float noise1 = snoise(pos * 3.0 + uTime * 0.1); // Large structures
      float noise2 = snoise(pos * 8.0 - uTime * 0.05); // Medium details
      
      // Combine noise
      float displacement = (noise1 * 0.4) + (noise2 * 0.15);
      
      // 3. ANATOMICAL SCULPTING
      
      // A. The Midline Split (Interhemispheric Fissure)
      // If x is close to 0, push vertices inward drastically
      float splitFactor = smoothstep(0.0, 0.2, abs(pos.x)); 
      // We multiply displacement by this to "silence" noise in the middle gap
      displacement *= splitFactor; 
      // We also physically push the mesh in at the center
      pos.x += (pos.x > 0.0 ? -0.05 : 0.05) * (1.0 - splitFactor);

      // B. The Bottom Flatness (Brainstem area)
      // Brains aren't round at the bottom
      if (pos.y < -0.5) {
        displacement *= 0.2; // Smooth out the bottom
      }

      // Apply displacement along normal
      vec3 newPos = pos + (normal * displacement * 0.3);
      
      vDisplacement = displacement;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);
    }
  `,
  // FRAGMENT SHADER
  `
    uniform float uTime;
    uniform vec3 uColor;
    uniform vec3 uRidgeColor;
    varying float vDisplacement;
    varying vec3 vNormal;

    void main() {
      // Mix colors based on displacement (Height)
      // Deep areas (Sulci) = Dark
      // High areas (Gyri) = Bright/Cyan
      
      float mixStrength = smoothstep(-0.2, 0.4, vDisplacement);
      vec3 finalColor = mix(uColor * 0.2, uRidgeColor, mixStrength);

      // Add Fresnel Rim Light (Alien Glow)
      vec3 viewDir = normalize(cameraPosition - vNormal); // Approximate view dir
      float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 3.0);
      
      finalColor += fresnel * vec3(0.5, 0.8, 1.0) * 0.5;
      
      // Scanline effect
      float scanline = sin(gl_FragCoord.y * 0.1 - uTime * 5.0);
      if(scanline > 0.95) finalColor += vec3(0.2);

      gl_FragColor = vec4(finalColor, 1.0);
    }
  `
);

extend({ BrainMaterial });

// TypeScript interface for the custom material
declare global {
  namespace JSX {
    interface IntrinsicElements {
      brainMaterial: any;
    }
  }
  namespace React {
    namespace JSX {
      interface IntrinsicElements {
        brainMaterial: any;
      }
    }
  }
}

const Brain = () => {
  const materialRef = useRef<any>(null);
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const { clock, mouse } = state;
    if (materialRef.current) {
      materialRef.current.uTime = clock.getElapsedTime();
      materialRef.current.uMouse = new THREE.Vector3(mouse.x, mouse.y, 0);
    }
    
    if (meshRef.current) {
      // Subtle floating rotation
      meshRef.current.rotation.y = clock.getElapsedTime() * 0.1;
      meshRef.current.rotation.z = Math.sin(clock.getElapsedTime() * 0.2) * 0.05;
    }
  });

  return (
    <group rotation={[0.3, 0, 0]}> {/* Tilt forward slightly to see the top split */}
      <mesh ref={meshRef}>
        {/* High detail Icosahedron is crucial for the displacement shader to work well */}
        <icosahedronGeometry args={[1.8, 60]} /> 
        <brainMaterial 
          ref={materialRef} 
          transparent 
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Inner Glow Core */}
      <mesh scale={[1.5, 1.5, 1.5]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial color="#1a0033" />
      </mesh>
    </group>
  );
};

export default Brain;
