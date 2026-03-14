import { Canvas } from '@react-three/fiber';
import { useGLTF, Environment, ContactShadows } from '@react-three/drei';
import { useRef } from 'react';
import * as THREE from 'three';

const MODEL_URL = 'https://res.cloudinary.com/dwgp11ukd/image/upload/v1772864696/mini_cartoon_keyboard_f2j08r.glb';

function Model(props: any) {
  const { scene } = useGLTF(MODEL_URL);
  const ref = useRef<THREE.Group>(null);

  return <primitive object={scene} ref={ref} {...props} />;
}

export default function KeyboardModel() {
  return (
    <div className="w-full h-full relative z-10">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
        <pointLight position={[-10, -10, -10]} intensity={1} />
        
        <Model 
          scale={0.35} 
          position={[0, -0.5, 0]} 
          rotation={[0.5, -0.4, 0]} 
        />
        
        <Environment preset="city" />
        <ContactShadows position={[0, -1.5, 0]} opacity={0.4} scale={10} blur={2.5} far={4} />
      </Canvas>
    </div>
  );
}

// Preload the model
useGLTF.preload(MODEL_URL);
