import { useCallback, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import { BackgroundLayer } from './components/BackgroundLayer'
import { OrangeSheet } from './components/OrangeSheet'
import { WhiteSheet } from './components/WhiteSheet'
import { NavySheet } from './components/NavySheet'
import { GreenSheet } from './components/GreenSheet'
import { STACK_GAP_REST, STACK_SPREAD_MULTIPLIER } from './constants/layers'

/**
 * Simple, tweakable lighting defaults (one "sun" + a little ambient).
 * - Raise `rendererExposure` for global brightness.
 * - Raise `sunIntensity` for stronger shadows.
 */
const LIGHTING = {
  rendererExposure: 1.85,

  // Raise to soften shadow contrast (less "inky" shadows).
  ambientIntensity: 0.42,

  sunPosition: [3.5, 5.5, 6] as THREE.Vector3Tuple,
  sunIntensity: 3.2,

  shadowMapSize: 4096,
  shadowBias: -0.00015,
  shadowNormalBias: 0.02,

  // Directional-light shadow frustum (orthographic). Tighten for crisper shadows.
  shadowCam: {
    left: -5,
    right: 5,
    top: 5,
    bottom: -5,
    near: 0.1,
    far: 30,
  },
} as const

function SimpleKeyLight() {
  return (
    <>
      <ambientLight intensity={LIGHTING.ambientIntensity} />
      <directionalLight
        position={LIGHTING.sunPosition}
        intensity={LIGHTING.sunIntensity}
        castShadow
        shadow-mapSize-width={LIGHTING.shadowMapSize}
        shadow-mapSize-height={LIGHTING.shadowMapSize}
        shadow-bias={LIGHTING.shadowBias}
        shadow-normalBias={LIGHTING.shadowNormalBias}
        shadow-camera-left={LIGHTING.shadowCam.left}
        shadow-camera-right={LIGHTING.shadowCam.right}
        shadow-camera-top={LIGHTING.shadowCam.top}
        shadow-camera-bottom={LIGHTING.shadowCam.bottom}
        shadow-camera-near={LIGHTING.shadowCam.near}
        shadow-camera-far={LIGHTING.shadowCam.far}
      />
    </>
  )
}

function App() {
  const [dragCount, setDragCount] = useState(0)
  const isAnyDragging = dragCount > 0

  const onDragStateChange = useCallback((dragging: boolean) => {
    setDragCount((c) => Math.max(0, c + (dragging ? 1 : -1)))
  }, [])

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        overscrollBehavior: 'none',
        touchAction: 'none',
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 2.5], fov: 45 }}
        style={{ background: '#1a1a2e', touchAction: 'none' }}
        shadows
        dpr={[1, 2]}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: LIGHTING.rendererExposure,
        }}
      >
        <SimpleKeyLight />
        <BackgroundLayer />
        <OrangeSheet
          isAnyDragging={isAnyDragging}
          onDragStateChange={onDragStateChange}
          stackRestGap={STACK_GAP_REST}
          stackSpreadMultiplier={STACK_SPREAD_MULTIPLIER}
        />
        <WhiteSheet
          isAnyDragging={isAnyDragging}
          onDragStateChange={onDragStateChange}
          stackRestGap={STACK_GAP_REST}
          stackSpreadMultiplier={STACK_SPREAD_MULTIPLIER}
        />
        <NavySheet
          isAnyDragging={isAnyDragging}
          onDragStateChange={onDragStateChange}
          stackRestGap={STACK_GAP_REST}
          stackSpreadMultiplier={STACK_SPREAD_MULTIPLIER}
        />
        <GreenSheet
          isAnyDragging={isAnyDragging}
          onDragStateChange={onDragStateChange}
          stackRestGap={STACK_GAP_REST}
          stackSpreadMultiplier={STACK_SPREAD_MULTIPLIER}
        />
      </Canvas>
    </div>
  )
}

export default App
