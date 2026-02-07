import { useRef, useLayoutEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import { BackgroundLayer } from './components/BackgroundLayer'
import { WhiteSheet } from './components/WhiteSheet'
import { NavySheet } from './components/NavySheet'

function SceneLights() {
  const spotRef = useRef<THREE.SpotLight>(null)
  const spotTargetRef = useRef<THREE.Group>(null)
  useLayoutEffect(() => {
    if (spotRef.current && spotTargetRef.current) {
      spotRef.current.target = spotTargetRef.current
    }
  }, [])
  return (
    <>
      <ambientLight intensity={0.55} />
      <group ref={spotTargetRef} position={[0, 0, 0]} />
      <spotLight
        ref={spotRef}
        position={[-5, 1.5, 9]}
        angle={0.65}
        penumbra={0.35}
        intensity={1.4}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={20}
        shadow-camera-fov={50}
      />
    </>
  )
}

function App() {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Canvas
        camera={{ position: [0, 0, 6], fov: 50 }}
        style={{ background: '#1a1a2e' }}
        shadows
      >
        <SceneLights />
        <BackgroundLayer />
        <WhiteSheet />
        <NavySheet />
      </Canvas>
    </div>
  )
}

export default App
