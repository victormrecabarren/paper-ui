import * as THREE from 'three'

/** Rectangle with evenly spaced circular holes (for white sheet). Outer shape is CCW; holes are CW. */
export function createSheetWithCircleHoles(
  width: number,
  height: number,
  cols: number,
  rows: number,
  circleRadius: number
): THREE.ShapeGeometry {
  // Higher segments => smoother circles (less "polygon" look).
  // Default is fairly low for close-up viewing.
  const CURVE_SEGMENTS = 64
  const halfW = width / 2
  const halfH = height / 2

  // Use the same spacing rule as the square-hole sheet:
  // Equal padding between circles AND between the edge circles and the sheet edge.
  //
  // Per axis:
  //   total = (count * diameter) + ((count + 1) * padding)
  //   => padding = (total - count * diameter) / (count + 1)
  //
  // IMPORTANT: padding is between circle EDGES, not centers.
  const DEFAULT_PADDING_FRACTION = 0.1
  const preferredRadius = Math.max(0, circleRadius)
  let r = preferredRadius
  let padX = cols > 0 ? (width - cols * 2 * r) / (cols + 1) : 0
  let padY = rows > 0 ? (height - rows * 2 * r) / (rows + 1) : 0

  // If the preferred radius doesn't fit, pick a radius that does.
  if (r <= 0 || padX <= 0 || padY <= 0) {
    const pad = Math.min(width, height) * DEFAULT_PADDING_FRACTION
    const rX = cols > 0 ? (width - (cols + 1) * pad) / (2 * cols) : 0
    const rY = rows > 0 ? (height - (rows + 1) * pad) / (2 * rows) : 0
    r = Math.max(0, Math.min(rX, rY))
    padX = cols > 0 ? (width - cols * 2 * r) / (cols + 1) : 0
    padY = rows > 0 ? (height - rows * 2 * r) / (rows + 1) : 0
  }
  const shape = new THREE.Shape()
  shape.moveTo(-halfW, -halfH)
  shape.lineTo(halfW, -halfH)
  shape.lineTo(halfW, halfH)
  shape.lineTo(-halfW, halfH)
  shape.closePath()

  // If we can't fit circles safely, return just the outer sheet.
  if (cols <= 0 || rows <= 0 || r <= 0 || padX <= 0 || padY <= 0) {
    return new THREE.ShapeGeometry(shape, CURVE_SEGMENTS)
  }

  for (let ix = 0; ix < cols; ix++) {
    for (let iy = 0; iy < rows; iy++) {
      const cx = -halfW + padX + r + ix * (2 * r + padX)
      const cy = -halfH + padY + r + iy * (2 * r + padY)
      const path = new THREE.Path()
      path.absarc(cx, cy, r, 0, Math.PI * 2, true)
      shape.holes.push(path)
    }
  }
  return new THREE.ShapeGeometry(shape, CURVE_SEGMENTS)
}

/** Rectangle with evenly spaced square holes (for navy sheet). Outer shape is CCW; holes are CW. */
export function createSheetWithSquareHoles(
  width: number,
  height: number,
  cols: number,
  rows: number,
  squareHalfSize: number
): THREE.ShapeGeometry {
  // Use a square outer sheet to keep the grid symmetric (per your request).
  const size = Math.min(width, height)
  const halfW = size / 2
  const halfH = size / 2

  // We want equal padding between holes AND between the edge holes and sheet edge.
  // Layout rule per axis:
  //   total = (count * holeSize) + ((count + 1) * padding)
  //   => padding = (total - count * holeSize) / (count + 1)
  //
  // If the caller's preferred `squareHalfSize` doesn't fit cleanly, we fall back
  // to a simple "10% padding" default and compute a hole size that fits.
  const DEFAULT_PADDING_FRACTION = 0.1
  const preferredHoleSize = Math.max(0, squareHalfSize * 2)
  const defaultPadding = size * DEFAULT_PADDING_FRACTION

  let holeSize = preferredHoleSize
  let padX = cols > 0 ? (size - cols * holeSize) / (cols + 1) : 0
  let padY = rows > 0 ? (size - rows * holeSize) / (rows + 1) : 0

  if (holeSize <= 0 || padX <= 0 || padY <= 0) {
    const holeSizeX = cols > 0 ? (size - (cols + 1) * defaultPadding) / cols : 0
    const holeSizeY = rows > 0 ? (size - (rows + 1) * defaultPadding) / rows : 0
    holeSize = Math.max(0, Math.min(holeSizeX, holeSizeY))
    padX = cols > 0 ? (size - cols * holeSize) / (cols + 1) : 0
    padY = rows > 0 ? (size - rows * holeSize) / (rows + 1) : 0
  }

  // If we still can't fit holes safely, return just the outer sheet.
  if (cols <= 0 || rows <= 0 || holeSize <= 0 || padX <= 0 || padY <= 0) {
    const shape = new THREE.Shape()
    shape.moveTo(-halfW, -halfH)
    shape.lineTo(halfW, -halfH)
    shape.lineTo(halfW, halfH)
    shape.lineTo(-halfW, halfH)
    shape.closePath()
    return new THREE.ShapeGeometry(shape)
  }

  const shape = new THREE.Shape()
  shape.moveTo(-halfW, -halfH)
  shape.lineTo(halfW, -halfH)
  shape.lineTo(halfW, halfH)
  shape.lineTo(-halfW, halfH)
  shape.closePath()

  // Place squares by bottom-left corners so padding is explicit.
  // Coordinate system is centered: outer bounds are [-half..half].
  for (let ix = 0; ix < cols; ix++) {
    for (let iy = 0; iy < rows; iy++) {
      const x0 = -halfW + padX + ix * (holeSize + padX)
      const y0 = -halfH + padY + iy * (holeSize + padY)
      const x1 = x0 + holeSize
      const y1 = y0 + holeSize

      // Hole must be opposite winding to the outer shape (CW).
      const hole = new THREE.Path()
      hole.moveTo(x0, y0)
      hole.lineTo(x0, y1)
      hole.lineTo(x1, y1)
      hole.lineTo(x1, y0)
      hole.closePath()
      shape.holes.push(hole)
    }
  }
  return new THREE.ShapeGeometry(shape)
}
