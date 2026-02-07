import { useCallback, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import { BackgroundLayer } from './components/BackgroundLayer'
import { OrangeSheet } from './components/OrangeSheet'
import { WhiteSheet } from './components/WhiteSheet'
import { NavySheet } from './components/NavySheet'
import { GreenSheet } from './components/GreenSheet'
import {
  POS_GREEN_SHEET,
  POS_NAVY_SHEET,
  POS_ORANGE_SHEET,
  POS_WHITE_SHEET,
  STACK_DRAG_FALLOFF,
  STACK_GAP_REST,
  STACK_SPREAD_MULTIPLIER,
  Z_SHEET_BASE,
} from './constants/layers'
import { PALETTE_LIST } from './constants/palette'

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

  const [positions, setPositions] = useState(() => ({
    orange: POS_ORANGE_SHEET,
    white: POS_WHITE_SHEET,
    navy: POS_NAVY_SHEET,
    green: POS_GREEN_SHEET,
  }))

  type SheetId = keyof typeof positions

  const [stackOrder, setStackOrder] = useState<SheetId[]>([
    'orange',
    'white',
    'navy',
    'green',
  ])

  const [colors, setColors] = useState<Record<SheetId, string>>({
    orange: PALETTE_LIST[4],
    white: PALETTE_LIST[0],
    navy: PALETTE_LIST[2],
    green: PALETTE_LIST[3],
  })

  const [backgroundColor, setBackgroundColor] = useState<string>(PALETTE_LIST[1])

  const stackIndexOf = useCallback(
    (id: SheetId) => {
      const idx = stackOrder.indexOf(id)
      return idx === -1 ? 0 : idx
    },
    [stackOrder]
  )

  const weightOf = useCallback(
    (id: SheetId) => {
      const topIndex = stackOrder.length - 1
      const idx = stackIndexOf(id)
      return Math.pow(STACK_DRAG_FALLOFF, topIndex - idx)
    },
    [stackIndexOf, stackOrder.length]
  )

  const onDragStateChange = useCallback((dragging: boolean) => {
    setDragCount((c) => Math.max(0, c + (dragging ? 1 : -1)))
  }, [])

  const onStackDragDelta = useCallback((delta: [number, number]) => {
    const [dx, dy] = delta
    setPositions((p) => ({
      orange: [p.orange[0] + dx * weightOf('orange'), p.orange[1] + dy * weightOf('orange')],
      white: [p.white[0] + dx * weightOf('white'), p.white[1] + dy * weightOf('white')],
      navy: [p.navy[0] + dx * weightOf('navy'), p.navy[1] + dy * weightOf('navy')],
      green: [p.green[0] + dx * weightOf('green'), p.green[1] + dy * weightOf('green')],
    }))
  }, [weightOf])

  const shuffleInPlace = <T,>(arr: T[]) => {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
    }
    return arr
  }

  const onShuffle = useCallback(() => {
    setStackOrder((prev) => shuffleInPlace([...prev]))

    // Deal out palette among all layers (background + 4 sheets).
    const palette = shuffleInPlace([...PALETTE_LIST])
    setColors({
      orange: palette[0],
      white: palette[1],
      navy: palette[2],
      green: palette[3],
    })
    setBackgroundColor(palette[4])
  }, [])

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        overscrollBehavior: 'none',
        touchAction: 'none',
        position: 'relative',
      }}
    >
      <button
        onClick={onShuffle}
        style={{
          position: 'absolute',
          top: 12,
          left: 12,
          zIndex: 10,
          padding: '10px 12px',
          borderRadius: 12,
          border: '1px solid rgba(255,255,255,0.15)',
          background: 'rgba(20,20,35,0.7)',
          color: 'white',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          cursor: 'pointer',
        }}
      >
        Shuffle layers
      </button>
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
        <BackgroundLayer color={backgroundColor} />

        {stackOrder.map((id) => {
          const sharedProps = {
            stackIndex: stackIndexOf(id),
            stackBaseZ: Z_SHEET_BASE,
            paperColor: colors[id],
            isAnyDragging,
            onDragStateChange,
            onDragDelta: onStackDragDelta,
            stackRestGap: STACK_GAP_REST,
            stackSpreadMultiplier: STACK_SPREAD_MULTIPLIER,
            position: positions[id],
          }

          switch (id) {
            case 'orange':
              return <OrangeSheet key={id} {...sharedProps} />
            case 'white':
              return <WhiteSheet key={id} {...sharedProps} />
            case 'navy':
              return <NavySheet key={id} {...sharedProps} />
            case 'green':
              return <GreenSheet key={id} {...sharedProps} />
          }
        })}
      </Canvas>
    </div>
  )
}

export default App
