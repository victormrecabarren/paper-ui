import * as THREE from 'three'

function computeEqualPaddingLayout({
  sizeX,
  sizeY,
  cols,
  rows,
  holeSizeXPreferred,
  holeSizeYPreferred,
  defaultPaddingFraction = 0.1,
}: {
  sizeX: number
  sizeY: number
  cols: number
  rows: number
  holeSizeXPreferred: number
  holeSizeYPreferred: number
  defaultPaddingFraction?: number
}): { holeSizeX: number; holeSizeY: number; padX: number; padY: number } | null {
  if (cols <= 0 || rows <= 0) return null
  const defaultPad = Math.min(sizeX, sizeY) * defaultPaddingFraction

  let holeSizeX = Math.max(0, holeSizeXPreferred)
  let holeSizeY = Math.max(0, holeSizeYPreferred)
  let padX = (sizeX - cols * holeSizeX) / (cols + 1)
  let padY = (sizeY - rows * holeSizeY) / (rows + 1)

  // If preferred hole sizes don't fit, compute a size that fits under default padding.
  if (holeSizeX <= 0 || holeSizeY <= 0 || padX <= 0 || padY <= 0) {
    holeSizeX = (sizeX - (cols + 1) * defaultPad) / cols
    holeSizeY = (sizeY - (rows + 1) * defaultPad) / rows
    const holeSize = Math.max(0, Math.min(holeSizeX, holeSizeY))
    holeSizeX = holeSize
    holeSizeY = holeSize
    padX = (sizeX - cols * holeSizeX) / (cols + 1)
    padY = (sizeY - rows * holeSizeY) / (rows + 1)
  }

  if (holeSizeX <= 0 || holeSizeY <= 0 || padX <= 0 || padY <= 0) return null
  return { holeSizeX, holeSizeY, padX, padY }
}

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

  const stepX = 2 * r + padX
  const stepY = 2 * r + padY

  // Stagger pattern by row (like a brick layout):
  //
  // X - X - X - X
  // - X - X - X -
  // X - X - X - X
  //
  // Odd rows shift by half a column, and contain one fewer hole
  // to keep a safe margin to the paper edge.
  for (let iy = 0; iy < rows; iy++) {
    const isOddRow = iy % 2 === 1
    const rowCols = isOddRow ? Math.max(0, cols - 1) : cols
    const rowShift = isOddRow ? stepX / 2 : 0
    const cy = -halfH + padY + r + iy * stepY

    for (let ix = 0; ix < rowCols; ix++) {
      const cx = -halfW + padX + r + rowShift + ix * stepX
      const path = new THREE.Path()
      path.absarc(cx, cy, r, 0, Math.PI * 2, true)
      shape.holes.push(path)
    }
  }
  return new THREE.ShapeGeometry(shape, CURVE_SEGMENTS)
}

/**
 * Circle holes aligned to the *solid posts* between a square-hole grid.
 *
 * Example: if the square sheet has 3x3 square holes, there are 4x4 "posts"
 * (the padding intersections). This places circle centers on those posts,
 * producing strong alignment patterns with the square sheet behind it.
 */
export function createSheetWithCircleHolesAlignedToSquareGrid(
  size: number,
  squareCols: number,
  squareRows: number,
  squareHalfSize: number,
  circleRadius: number
): THREE.ShapeGeometry {
  const CURVE_SEGMENTS = 64
  const half = size / 2

  // Reuse the square layout math so circle centers lock to the same padding grid.
  const layout = computeEqualPaddingLayout({
    sizeX: size,
    sizeY: size,
    cols: squareCols,
    rows: squareRows,
    holeSizeXPreferred: squareHalfSize * 2,
    holeSizeYPreferred: squareHalfSize * 2,
  })

  const shape = new THREE.Shape()
  shape.moveTo(-half, -half)
  shape.lineTo(half, -half)
  shape.lineTo(half, half)
  shape.lineTo(-half, half)
  shape.closePath()

  if (!layout || circleRadius <= 0) return new THREE.ShapeGeometry(shape, CURVE_SEGMENTS)

  const { holeSizeX, holeSizeY, padX, padY } = layout
  const r = circleRadius

  // Centers of the padding "posts" (cols+1 by rows+1).
  // Each post sits in the middle of a padding strip, hence pad/2 offset.
  const postCols = squareCols + 1
  const postRows = squareRows + 1
  const stepX = holeSizeX + padX
  const stepY = holeSizeY + padY

  // Use interior post intersections so circles can keep a fixed radius without
  // being forced tiny near the sheet boundary.
  for (let ix = 1; ix < postCols - 1; ix++) {
    for (let iy = 1; iy < postRows - 1; iy++) {
      const cx = -half + padX / 2 + ix * stepX
      const cy = -half + padY / 2 + iy * stepY

      // Extra safety in case parameters get pushed too far.
      if (cx < -half + r || cx > half - r || cy < -half + r || cy > half - r) continue

      const path = new THREE.Path()
      path.absarc(cx, cy, r, 0, Math.PI * 2, true)
      shape.holes.push(path)
    }
  }

  return new THREE.ShapeGeometry(shape, CURVE_SEGMENTS)
}

/**
 * Circle holes centered at the CORNERS of each square cutout.
 *
 * This is the layout that produces quarter-circles visible inside each square hole
 * when the square-hole sheet is placed on top (matching your reference image).
 */
export function createSheetWithCircleHolesAtSquareCorners(
  size: number,
  squareCols: number,
  squareRows: number,
  squareHalfSize: number,
  circleRadius: number
): THREE.ShapeGeometry {
  const CURVE_SEGMENTS = 64
  const half = size / 2

  const shape = new THREE.Shape()
  shape.moveTo(-half, -half)
  shape.lineTo(half, -half)
  shape.lineTo(half, half)
  shape.lineTo(-half, half)
  shape.closePath()

  if (circleRadius <= 0) return new THREE.ShapeGeometry(shape, CURVE_SEGMENTS)

  const layout = computeEqualPaddingLayout({
    sizeX: size,
    sizeY: size,
    cols: squareCols,
    rows: squareRows,
    holeSizeXPreferred: squareHalfSize * 2,
    holeSizeYPreferred: squareHalfSize * 2,
  })
  if (!layout) return new THREE.ShapeGeometry(shape, CURVE_SEGMENTS)

  const { holeSizeX: holeSize, padX, padY } = layout

  // Build unique corner centers from the square grid.
  const key = (x: number, y: number) => `${x.toFixed(6)},${y.toFixed(6)}`
  const corners = new Map<string, { x: number; y: number }>()

  for (let ix = 0; ix < squareCols; ix++) {
    for (let iy = 0; iy < squareRows; iy++) {
      const x0 = -half + padX + ix * (holeSize + padX)
      const y0 = -half + padY + iy * (holeSize + padY)
      const x1 = x0 + holeSize
      const y1 = y0 + holeSize

      const pts = [
        { x: x0, y: y0 },
        { x: x0, y: y1 },
        { x: x1, y: y0 },
        { x: x1, y: y1 },
      ]
      for (const p of pts) corners.set(key(p.x, p.y), p)
    }
  }

  for (const { x: cx, y: cy } of corners.values()) {
    // Avoid holes that would poke outside the sheet boundary.
    if (cx < -half + circleRadius || cx > half - circleRadius) continue
    if (cy < -half + circleRadius || cy > half - circleRadius) continue

    const path = new THREE.Path()
    path.absarc(cx, cy, circleRadius, 0, Math.PI * 2, true)
    shape.holes.push(path)
  }

  return new THREE.ShapeGeometry(shape, CURVE_SEGMENTS)
}

/**
 * Staggered circle rows aligned to square-hole CENTERS.
 *
 * - Circle row 0 centers land on square row 0 centers
 * - Circle row 1 is horizontally offset by half a column step and vertically halfway
 *   between square rows 0 and 1
 * - Circle row 2 centers land on square row 1 centers
 * - ...and so on (rows = squareRows*2 - 1)
 *
 * This produces the relationship you described:
 * row1 circles align with row1 squares; row3 circles align with row2 squares, etc.
 *
 * Circle size is derived from the square hole size so that a square cutout placed
 * on top reveals the full circle.
 */
export function createSheetWithStaggeredCircleHolesAlignedToSquareCenters(
  size: number,
  squareCols: number,
  squareRows: number,
  squareHalfSize: number,
  circleScale: number = 0.62
): THREE.ShapeGeometry {
  const CURVE_SEGMENTS = 64
  const half = size / 2

  const shape = new THREE.Shape()
  shape.moveTo(-half, -half)
  shape.lineTo(half, -half)
  shape.lineTo(half, half)
  shape.lineTo(-half, half)
  shape.closePath()

  const layout = computeEqualPaddingLayout({
    sizeX: size,
    sizeY: size,
    cols: squareCols,
    rows: squareRows,
    holeSizeXPreferred: squareHalfSize * 2,
    holeSizeYPreferred: squareHalfSize * 2,
  })
  if (!layout) return new THREE.ShapeGeometry(shape, CURVE_SEGMENTS)

  const { holeSizeX: holeSize, padX, padY } = layout
  const stepX = holeSize + padX
  const stepY = holeSize + padY

  // Circle radius derived from square hole half-size.
  // Clamp to keep it reasonable if someone passes weird values.
  const r = Math.max(0.001, Math.min(squareHalfSize * Math.max(0.1, circleScale), squareHalfSize))

  // Precompute square center coordinates.
  const squareCentersX: number[] = []
  const squareCentersY: number[] = []
  for (let ix = 0; ix < squareCols; ix++) {
    squareCentersX.push(-half + padX + holeSize / 2 + ix * stepX)
  }
  for (let iy = 0; iy < squareRows; iy++) {
    squareCentersY.push(-half + padY + holeSize / 2 + iy * stepY)
  }

  const circleRows = Math.max(0, squareRows * 2 - 1)

  for (let row = 0; row < circleRows; row++) {
    const isOffsetRow = row % 2 === 1
    const squareRowA = Math.floor(row / 2)

    // Y: either square center row, or halfway between successive square rows.
    const cy = isOffsetRow
      ? (squareCentersY[squareRowA] + squareCentersY[squareRowA + 1]) / 2
      : squareCentersY[squareRowA]

    // X: either square centers, or shifted by half a column step.
    const rowCols = isOffsetRow ? Math.max(0, squareCols - 1) : squareCols
    const xShift = isOffsetRow ? stepX / 2 : 0

    for (let ix = 0; ix < rowCols; ix++) {
      const cx = squareCentersX[ix] + xShift

      // Keep holes fully inside the sheet boundary.
      if (cx < -half + r || cx > half - r || cy < -half + r || cy > half - r) continue

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

  const layout = computeEqualPaddingLayout({
    sizeX: size,
    sizeY: size,
    cols,
    rows,
    holeSizeXPreferred: squareHalfSize * 2,
    holeSizeYPreferred: squareHalfSize * 2,
  })

  // If we can't fit holes safely, return just the outer sheet.
  if (!layout) {
    const shape = new THREE.Shape()
    shape.moveTo(-halfW, -halfH)
    shape.lineTo(halfW, -halfH)
    shape.lineTo(halfW, halfH)
    shape.lineTo(-halfW, halfH)
    shape.closePath()
    return new THREE.ShapeGeometry(shape)
  }

  const { holeSizeX: holeSize, padX, padY } = layout

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
