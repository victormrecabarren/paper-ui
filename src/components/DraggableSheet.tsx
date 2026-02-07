import { useRef, useState, useCallback, useEffect } from 'react'
import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'

export function DraggableSheet({
  planeZ,
  stackIndex = 0,
  stackRestGap = 0,
  stackSpreadMultiplier = 1,
  stackDamping = 18,
  /** Small extra "picked up" lift for the active sheet, in multiples of the extra gap. */
  activeLiftMultiplier = 1,
  isAnyDragging = false,
  onDragStateChange,
  onDragDelta,
  position,
  geometry,
  color,
  texture,
  hitAreaSize,
}: {
  /** Base Z of the whole stack (all sheets share this). */
  planeZ: number
  /**
   * 0-based stacking order. Higher index = visually higher when the stack "spreads".
   * This never changes ordering; it only increases spacing while dragging.
   */
  stackIndex?: number
  /** Resting distance between adjacent layers (used to compute spread). */
  stackRestGap?: number
  /** 1 = rest, 1.5 = 50% more spacing between layers. */
  stackSpreadMultiplier?: number
  /** Higher = faster ease in/out for the spread animation. */
  stackDamping?: number
  activeLiftMultiplier?: number
  /** When true, the whole stack spreads (used to keep the animation consistent). */
  isAnyDragging?: boolean
  /** Notifies parent when this sheet starts/stops dragging. */
  onDragStateChange?: (isDragging: boolean) => void
  /** Emits drag delta (world units) while dragging. */
  onDragDelta?: (delta: [number, number]) => void
  /** Controlled XY position (stack dragging updates this from above). */
  position: [number, number]
  geometry: THREE.BufferGeometry
  color: string
  texture?: THREE.CanvasTexture
  /** Full [width, height] for pointer hit area (so dragging works when clicking holes). */
  hitAreaSize?: [number, number]
}) {
  const [isDragging, setIsDragging] = useState(false)
  const { camera, gl, size } = useThree()
  const groupRef = useRef<THREE.Group>(null)
  const planeRef = useRef(new THREE.Plane())
  const spreadRef = useRef(1)
  const activeLiftRef = useRef(0)
  const prevDraggingRef = useRef<boolean | null>(null)
  const lastDragPointRef = useRef<THREE.Vector3 | null>(null)
  const raycasterRef = useRef(new THREE.Raycaster())
  const pointerRef = useRef(new THREE.Vector2())
  const pointRef = useRef(new THREE.Vector3())

  const intersectAtClient = useCallback(
    (clientX: number, clientY: number) => {
      pointerRef.current.x = (clientX / size.width) * 2 - 1
      pointerRef.current.y = -(clientY / size.height) * 2 + 1
      raycasterRef.current.setFromCamera(pointerRef.current, camera)
      return raycasterRef.current.ray.intersectPlane(planeRef.current, pointRef.current)
    },
    [camera, size.width, size.height]
  )

  const onPointerDown = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation()
      intersectAtClient(e.nativeEvent.clientX, e.nativeEvent.clientY)
      lastDragPointRef.current = pointRef.current.clone()
      setIsDragging(true)
      gl.domElement.setPointerCapture(e.nativeEvent.pointerId)
    },
    [gl.domElement, intersectAtClient]
  )

  const onPointerUp = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      setIsDragging(false)
      lastDragPointRef.current = null
      try {
        gl.domElement.releasePointerCapture(e.nativeEvent.pointerId)
      } catch {
        // already released
      }
    },
    [gl.domElement]
  )

  // Initialize the drag plane so the first move event is stable.
  useEffect(() => {
    const z0 = planeZ + stackIndex * stackRestGap
    planeRef.current.setFromNormalAndCoplanarPoint(
      new THREE.Vector3(0, 0, 1),
      new THREE.Vector3(0, 0, z0)
    )
  }, [planeZ, stackIndex, stackRestGap])

  useEffect(() => {
    const prev = prevDraggingRef.current
    prevDraggingRef.current = isDragging
    if (prev == null || prev === isDragging) return
    onDragStateChange?.(isDragging)
  }, [isDragging, onDragStateChange])

  // Subtle stack spread while dragging (e.g. 1 -> 1.5), plus a tiny extra lift
  // for the active sheet so it feels "picked up" without changing ordering.
  useFrame((_, delta) => {
    const spreadTarget = isAnyDragging ? stackSpreadMultiplier : 1
    spreadRef.current = THREE.MathUtils.damp(
      spreadRef.current,
      spreadTarget,
      stackDamping,
      delta
    )

    const extraGap = stackRestGap * (stackSpreadMultiplier - 1)
    const activeLiftTarget = isDragging ? extraGap * activeLiftMultiplier : 0
    activeLiftRef.current = THREE.MathUtils.damp(
      activeLiftRef.current,
      activeLiftTarget,
      stackDamping,
      delta
    )

    // Z is derived from a shared base + stack index.
    // At rest: base + index*gap
    // While dragging: base + index*gap*multiplier
    const z = planeZ + stackIndex * stackRestGap * spreadRef.current + activeLiftRef.current

    // Keep the drag plane aligned to the visual Z so the sheet stays "under" the finger.
    planeRef.current.setFromNormalAndCoplanarPoint(
      new THREE.Vector3(0, 0, 1),
      new THREE.Vector3(0, 0, z)
    )

    if (groupRef.current) groupRef.current.position.set(position[0], position[1], z)
  })

  useEffect(() => {
    if (!isDragging) return
    const canvas = gl.domElement
    const onMove = (e: PointerEvent) => {
      if (!intersectAtClient(e.clientX, e.clientY)) return
      const prev = lastDragPointRef.current
      if (!prev) {
        lastDragPointRef.current = pointRef.current.clone()
        return
      }
      const dx = pointRef.current.x - prev.x
      const dy = pointRef.current.y - prev.y
      lastDragPointRef.current = pointRef.current.clone()
      onDragDelta?.([dx, dy])
    }
    canvas.addEventListener('pointermove', onMove)
    return () => canvas.removeEventListener('pointermove', onMove)
  }, [isDragging, gl.domElement, intersectAtClient, onDragDelta])

  return (
    <group
      ref={groupRef}
      position={[position[0], position[1], planeZ + stackIndex * stackRestGap]}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
    >
      {hitAreaSize != null && (
        <mesh>
          <planeGeometry args={[hitAreaSize[0], hitAreaSize[1]]} />
          <meshBasicMaterial
            transparent
            opacity={0}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
      <mesh castShadow receiveShadow>
        <primitive object={geometry} attach="geometry" />
        <meshStandardMaterial
          color={color}
          map={texture}
          roughness={0.9}
          metalness={0.02}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  )
}
