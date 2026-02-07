import { useMemo } from 'react'
import * as THREE from 'three'
import { createPaperTexture } from '../utils/paperTexture'

const TABLE_SIZE = 8
const Z_BACKGROUND = 0

export function BackgroundLayer() {
  const texture = useMemo(() => createPaperTexture('#1F99B1', 0.14), [])
  return (
    <mesh
      position={[0, 0, Z_BACKGROUND]}
      rotation={[-Math.PI / 2, 0, 0]}
      receiveShadow
    >
      <planeGeometry args={[TABLE_SIZE, TABLE_SIZE]} />
      <meshStandardMaterial
        map={texture}
        color="#1F99B1"
        roughness={0.95}
        metalness={0.02}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}
