import { useRef, useState, useCallback, useEffect } from 'react'
import { useThree, type ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'

export function DraggableSheet({
  planeZ,
  geometry,
  color,
  texture,
  hitAreaSize,
  initialPosition = [0, 0],
}: {
  planeZ: number
  geometry: THREE.BufferGeometry
  color: string
  texture?: THREE.CanvasTexture
  /** Full [width, height] for pointer hit area (so dragging works when clicking holes). */
  hitAreaSize?: [number, number]
  initialPosition?: [number, number]
}) {
  const [position, setPosition] = useState<[number, number]>(initialPosition)
  const [isDragging, setIsDragging] = useState(false)
  const dragOffsetRef = useRef<[number, number]>([0, 0])
  const { camera, gl, size } = useThree()
  const planeRef = useRef(
    (() => {
      const p = new THREE.Plane()
      p.setFromNormalAndCoplanarPoint(
        new THREE.Vector3(0, 0, 1),
        new THREE.Vector3(0, 0, planeZ)
      )
      return p
    })()
  )
  const raycasterRef = useRef(new THREE.Raycaster())
  const pointerRef = useRef(new THREE.Vector2())
  const pointRef = useRef(new THREE.Vector3())

  const onPointerDown = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation()
      dragOffsetRef.current = [position[0] - e.point.x, position[1] - e.point.y]
      setIsDragging(true)
      gl.domElement.setPointerCapture(e.nativeEvent.pointerId)
    },
    [gl.domElement, position]
  )

  const onPointerUp = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      setIsDragging(false)
      try {
        gl.domElement.releasePointerCapture(e.nativeEvent.pointerId)
      } catch {
        // already released
      }
    },
    [gl.domElement]
  )

  useEffect(() => {
    if (!isDragging) return
    const canvas = gl.domElement
    const onMove = (e: PointerEvent) => {
      pointerRef.current.x = (e.clientX / size.width) * 2 - 1
      pointerRef.current.y = -(e.clientY / size.height) * 2 + 1
      raycasterRef.current.setFromCamera(pointerRef.current, camera)
      if (
        raycasterRef.current.ray.intersectPlane(
          planeRef.current,
          pointRef.current
        )
      ) {
        const [dx, dy] = dragOffsetRef.current
        setPosition([pointRef.current.x + dx, pointRef.current.y + dy])
      }
    }
    canvas.addEventListener('pointermove', onMove)
    return () => canvas.removeEventListener('pointermove', onMove)
  }, [isDragging, camera, gl.domElement, size.width, size.height])

  return (
    <group
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
    >
      {hitAreaSize != null && (
        <mesh position={[position[0], position[1], planeZ]}>
          <planeGeometry args={[hitAreaSize[0], hitAreaSize[1]]} />
          <meshBasicMaterial
            transparent
            opacity={0}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
      <mesh
        position={[position[0], position[1], planeZ]}
        castShadow
        receiveShadow
      >
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
