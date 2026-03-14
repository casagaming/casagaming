import { Suspense } from 'react';
import { useGLTF, Stage, OrbitControls, Environment, ContactShadows, Html, Loader } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Facebook, Twitter, Instagram, Linkedin, Github, Youtube } from 'lucide-react';

function Model(props: any) {
  // Using the new user-provided URL
  const { scene } = useGLTF('https://res.cloudinary.com/dwgp11ukd/image/upload/v1772864696/mini_cartoon_keyboard_f2j08r.glb');
  return <primitive object={scene} {...props} />;
}

// Button configuration
const socialButtons = [
  { icon: Facebook, color: '#1877F2', url: 'https://facebook.com', position: [-0.6, 0.3, -0.2] },
  { icon: Twitter, color: '#1DA1F2', url: 'https://twitter.com', position: [0, 0.3, -0.2] },
  { icon: Instagram, color: '#E4405F', url: 'https://instagram.com', position: [0.6, 0.3, -0.2] },
  { icon: Linkedin, color: '#0A66C2', url: 'https://linkedin.com', position: [-0.6, 0.3, 0.2] },
  { icon: Github, color: '#181717', url: 'https://github.com', position: [0, 0.3, 0.2] },
  { icon: Youtube, color: '#FF0000', url: 'https://youtube.com', position: [0.6, 0.3, 0.2] },
];

function SocialButtons() {
  return (
    <group position={[0, 0, 0]}>
      {socialButtons.map((btn, index) => (
        <Html
          key={index}
          position={btn.position as [number, number, number]}
          transform
          occlude
          distanceFactor={1.2}
          style={{
            transition: 'all 0.2s',
            opacity: 1,
            transform: 'scale(1)',
          }}
        >
          <a
            href={btn.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:scale-125 hover:bg-white transition-all duration-200 border border-white/50 cursor-pointer group"
            onClick={(e) => e.stopPropagation()}
          >
            <btn.icon size={20} style={{ color: btn.color }} className="group-hover:opacity-100 opacity-90" />
          </a>
        </Html>
      ))}
    </group>
  );
}

export default function SocialMediaKeyboard() {
  return (
    <div className="w-full h-full relative">
      <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 5, 8], fov: 45 }}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} shadow-mapSize={2048} castShadow />
          
          <Stage environment="city" intensity={0.6} shadows={false} adjustCamera={false}>
            <group>
              <Model scale={0.01} />
              <SocialButtons />
            </group>
          </Stage>
          
          <ContactShadows position={[0, -0.5, 0]} opacity={0.4} scale={10} blur={2.5} far={4} />
          <Environment preset="city" />
          
          <OrbitControls 
            enableZoom={false} 
            makeDefault 
            minPolarAngle={Math.PI / 4} 
            maxPolarAngle={Math.PI / 2}
            autoRotate={false}
          />
        </Suspense>
      </Canvas>
      <Loader />
    </div>
  );
}

// Preload the new model
useGLTF.preload('https://res.cloudinary.com/dwgp11ukd/image/upload/v1772864696/mini_cartoon_keyboard_f2j08r.glb');
