import { Canvas, useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import { Environment, Float, Stars } from '@react-three/drei';

const FloatingShapes = () => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.05;
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      <Float speed={1.5} rotationIntensity={1} floatIntensity={2}>
        <mesh position={[-4, 2, -5]} rotation={[0.5, 0.5, 0]}>
          <octahedronGeometry args={[1.5, 0]} />
          <meshStandardMaterial color="#3b82f6" wireframe opacity={0.5} transparent />
        </mesh>
      </Float>
      
      <Float speed={2} rotationIntensity={1.5} floatIntensity={1.5}>
        <mesh position={[5, -2, -8]} rotation={[0.2, 0.8, 0]}>
          <torusGeometry args={[1.2, 0.4, 16, 32]} />
          <meshStandardMaterial color="#10b981" wireframe opacity={0.4} transparent />
        </mesh>
      </Float>

      <Float speed={1} rotationIntensity={0.5} floatIntensity={1}>
        <mesh position={[2, 4, -10]} rotation={[0.1, 0.1, 0.1]}>
          <icosahedronGeometry args={[2, 0]} />
          <meshStandardMaterial color="#8b5cf6" wireframe opacity={0.3} transparent />
        </mesh>
      </Float>
    </group>
  );
};

export default function ThreeBackground() {
  return (
    <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
      <ambientLight intensity={0.2} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <FloatingShapes />
      <Environment preset="city" />
      <fog attach="fog" args={['#0f172a', 10, 30]} />
    </Canvas>
  );
}
