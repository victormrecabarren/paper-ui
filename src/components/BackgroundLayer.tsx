import { useMemo } from 'react'
import * as THREE from 'three'
import { createPaperTexture } from '../utils/paperTexture'
import { Z_BACKGROUND_LAYER } from '../constants/layers'

const TABLE_SIZE = 8
const TABLE_COLOR = '#5FE8F2'

export function BackgroundLayer() {
  // Use the same construction-paper texture approach as the sheets.
  // Repeat it so the grain scale doesn't look "flat" on a large table plane.
  const texture = useMemo(() => {
    const tex = createPaperTexture(TABLE_COLOR, 0.1)
    tex.repeat.set(4.5, 4.5)
    tex.needsUpdate = true
    return tex
  }, [])
  return (
    <mesh
      position={[0, 0, Z_BACKGROUND_LAYER]}
      receiveShadow
    >
      <planeGeometry args={[TABLE_SIZE, TABLE_SIZE]} />
      <meshStandardMaterial
        map={texture}
        color="#ffffff"
        roughness={0.95}
        metalness={0.02}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}
