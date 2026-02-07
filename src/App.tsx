import { useCallback, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
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

  sunIntensity: 3.2,

  /** Sun travels a square parallel to the sheets (xy plane). Order: upper-left → upper-right → bottom-right → bottom-left → repeat. */
  sunSquareHalfExtent: 5,
  /** Distance in front of the sheets (z). */
  sunOrbitZ: 8,
  /** Seconds to complete one full square (all four edges). */
  sunSquarePeriod: 24,

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

/** Round to step to reduce shadow-map jitter. */
const SHADOW_STABILITY_STEP = 0.003

/** Seconds to travel from one corner to the next. */
const LIGHT_TRAVEL_DURATION = 0.35

/** Smooth start and end. */
function easeInOutCubic(t: number): number {
  return t * t * (3 - 2 * t)
}

/** Square corners in xy: [upper-left, upper-right, bottom-right, bottom-left]. */
function getSquareCorners(r: number): [number, number][] {
  return [[-r, r], [r, r], [r, -r], [-r, -r]]
}

/** 0=upper-left, 1=upper-right, 2=lower-right, 3=lower-left, 4=off */
type LightState = 0 | 1 | 2 | 3 | 4

function RotatingSunLight({ lightState }: { lightState: LightState }) {
  const lightRef = useRef<THREE.DirectionalLight>(null)
  const corners = useRef<[number, number][] | null>(null)
  if (!corners.current) corners.current = getSquareCorners(LIGHTING.sunSquareHalfExtent)

  const prevStateRef = useRef<LightState>(lightState)
  const fromRef = useRef<[number, number]>([...corners.current![0]])
  const toRef = useRef<[number, number]>([...corners.current![0]])
  const progressRef = useRef(1)

  useFrame((_, delta) => {
    const light = lightRef.current
    if (!light || !corners.current) return

    const prev = prevStateRef.current
    if (prev !== lightState) {
      prevStateRef.current = lightState
      if (lightState === 4) {
        progressRef.current = 1
        return
      }
      if (prev === 4) {
        fromRef.current = [...corners.current[lightState]]
        toRef.current = [...corners.current[lightState]]
        progressRef.current = 1
      } else {
        fromRef.current = [...corners.current[prev]]
        toRef.current = [...corners.current[lightState]]
        progressRef.current = 0
      }
    }

    if (lightState === 4) return

    let progress = progressRef.current
    if (progress < 1) {
      progress = Math.min(1, progress + delta / LIGHT_TRAVEL_DURATION)
      progressRef.current = progress
    }

    const eased = easeInOutCubic(progress)
    const [x0, y0] = fromRef.current
    const [x1, y1] = toRef.current
    const x = x0 + eased * (x1 - x0)
    const y = y0 + eased * (y1 - y0)
    const round = (v: number) =>
      Math.round(v / SHADOW_STABILITY_STEP) * SHADOW_STABILITY_STEP
    light.position.x = round(x)
    light.position.y = round(y)
    light.position.z = LIGHTING.sunOrbitZ
    light.updateMatrixWorld(true)
  })

  const ambientIntensity = lightState === 4 ? 0.75 : LIGHTING.ambientIntensity
  const cornersArr = getSquareCorners(LIGHTING.sunSquareHalfExtent)
  const initialPos = lightState === 4 ? cornersArr[0] : cornersArr[lightState]

  return (
    <>
      <ambientLight intensity={ambientIntensity} />
      {lightState !== 4 && (
        <directionalLight
          ref={lightRef}
          position={[initialPos[0], initialPos[1], LIGHTING.sunOrbitZ]}
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
      )}
    </>
  )
}

const LIGHT_CORNER_BOX_SIZE = 44
const LIGHT_DOT_OFFSET = 10
const LIGHT_DOT_SIZE = 10

function LightCornerControl({
  lightState,
  onCycle,
  style,
}: {
  lightState: LightState
  onCycle: () => void
  style: React.CSSProperties
}) {
  return (
    <button
      type="button"
      onClick={onCycle}
      style={{
        ...style,
        width: LIGHT_CORNER_BOX_SIZE,
        height: LIGHT_CORNER_BOX_SIZE,
        padding: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}
      title={
        lightState === 4
          ? 'Light off (click to cycle)'
          : `Light from ${['upper-left', 'upper-right', 'lower-right', 'lower-left'][lightState]} (click to cycle)`
      }
    >
      {/* 4 dots: top-left, top-right, bottom-right, bottom-left */}
      {([0, 1, 2, 3] as const).map((i) => {
        const isLit = lightState === i
        const pos: React.CSSProperties =
          i === 0
            ? { top: LIGHT_DOT_OFFSET, left: LIGHT_DOT_OFFSET }
            : i === 1
              ? { top: LIGHT_DOT_OFFSET, right: LIGHT_DOT_OFFSET }
              : i === 2
                ? { bottom: LIGHT_DOT_OFFSET, right: LIGHT_DOT_OFFSET }
                : { bottom: LIGHT_DOT_OFFSET, left: LIGHT_DOT_OFFSET }
        return (
          <span
            key={i}
            style={{
              position: 'absolute',
              width: LIGHT_DOT_SIZE,
              height: LIGHT_DOT_SIZE,
              borderRadius: '50%',
              background: isLit ? 'rgba(255, 220, 120, 0.95)' : 'rgba(255,255,255,0.2)',
              ...pos,
            }}
          />
        )
      })}
    </button>
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
  const [lightState, setLightState] = useState<LightState>(0)

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

  const onResetPositions = useCallback(() => {
    setPositions({
      orange: POS_ORANGE_SHEET,
      white: POS_WHITE_SHEET,
      navy: POS_NAVY_SHEET,
      green: POS_GREEN_SHEET,
    })
  }, [])

  const buttonStyle = {
    padding: '10px 12px',
    borderRadius: 12,
    border: '1px solid rgba(255,255,255,0.15)',
    background: 'rgba(20,20,35,0.7)',
    color: 'white',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    cursor: 'pointer' as const,
  }

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        overscrollBehavior: 'none',
        touchAction: 'none',
        position: 'relative',
        WebkitTouchCallout: 'none',
        WebkitUserSelect: 'none',
        userSelect: 'none',
      }}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div
        style={{
          position: 'absolute',
          top: 12,
          left: 12,
          zIndex: 10,
          display: 'flex',
          gap: 8,
        }}
      >
        <button onClick={onShuffle} style={buttonStyle}>
          Shuffle layers
        </button>
        <button onClick={onResetPositions} style={buttonStyle}>
          Reset position
        </button>
        <LightCornerControl
          lightState={lightState}
          onCycle={() => setLightState((s) => ((s + 1) % 5) as LightState)}
          style={buttonStyle}
        />
      </div>
      <Canvas
        camera={{ position: [0, 0, 2.5], fov: 45 }}
        style={{
          background: '#1a1a2e',
          touchAction: 'none',
          WebkitTouchCallout: 'none',
          WebkitUserSelect: 'none',
          userSelect: 'none',
        }}
        onContextMenu={(e) => e.preventDefault()}
        shadows
        dpr={[1, 2]}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: LIGHTING.rendererExposure,
        }}
      >
        <RotatingSunLight lightState={lightState} />
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
