import * as THREE from 'three'

/** Evenly spaced positions across (min, max) with margin from edges. */
function spacedPositions(count: number, min: number, max: number, margin: number): number[] {
  if (count <= 0) return []
  if (count === 1) return [(min + max) / 2]
  const span = (max - min) - 2 * margin
  const step = span / (count - 1)
  const out: number[] = []
  for (let i = 0; i < count; i++) out.push(min + margin + i * step)
  return out
}

/** Rectangle with evenly spaced circular holes (for white sheet). Outer shape is CCW; holes are CW. */
export function createSheetWithCircleHoles(
  width: number,
  height: number,
  cols: number,
  rows: number,
  circleRadius: number
): THREE.ShapeGeometry {
  const halfW = width / 2
  const halfH = height / 2
  const margin = Math.min(width, height) * 0.12
  const shape = new THREE.Shape()
  shape.moveTo(-halfW, -halfH)
  shape.lineTo(halfW, -halfH)
  shape.lineTo(halfW, halfH)
  shape.lineTo(-halfW, halfH)
  shape.closePath()
  const xs = spacedPositions(cols, -halfW, halfW, margin)
  const ys = spacedPositions(rows, -halfH, halfH, margin)
  for (const x of xs) {
    for (const y of ys) {
      const path = new THREE.Path()
      path.absarc(x, y, circleRadius, 0, Math.PI * 2, true)
      shape.holes.push(path)
    }
  }
  return new THREE.ShapeGeometry(shape)
}

/** Rectangle with evenly spaced square holes (for navy sheet). Outer shape is CCW; holes are CW. */
export function createSheetWithSquareHoles(
  width: number,
  height: number,
  cols: number,
  rows: number,
  squareHalfSize: number
): THREE.ShapeGeometry {
  const halfW = width / 2
  const halfH = height / 2
  const margin = Math.min(width, height) * 0.12
  const shape = new THREE.Shape()
  shape.moveTo(-halfW, -halfH)
  shape.lineTo(halfW, -halfH)
  shape.lineTo(halfW, halfH)
  shape.lineTo(-halfW, halfH)
  shape.closePath()
  const xs = spacedPositions(cols, -halfW, halfW, margin)
  const ys = spacedPositions(rows, -halfH, halfH, margin)
  const s = squareHalfSize
  for (const cx of xs) {
    for (const cy of ys) {
      const hole = new THREE.Path()
      hole.moveTo(cx - s, cy - s)
      hole.lineTo(cx - s, cy + s)
      hole.lineTo(cx + s, cy + s)
      hole.lineTo(cx + s, cy - s)
      hole.closePath()
      shape.holes.push(hole)
    }
  }
  return new THREE.ShapeGeometry(shape)
}
