import { useMemo } from 'react'
import { createPaperTexture } from '../utils/paperTexture'
import { createSheetWithStaggeredCircleHolesAlignedToSquareCenters } from '../utils/paperGeometries'
import { DraggableSheet } from './DraggableSheet'

const GREEN_SHEET_WIDTH = 3.6
const GREEN_SHEET_HEIGHT = 3.6
// Match the square sheet's grid so patterns align.
const SQUARE_HOLES = 6
const SQUARE_HALF = 0.22
const CIRCLE_SCALE = 0.62

export function GreenSheet({
  stackIndex,
  stackBaseZ,
  paperColor = '#47B36A',
  isAnyDragging,
  onDragStateChange,
  stackRestGap,
  stackSpreadMultiplier,
  position,
  onDragDelta,
}: {
  stackIndex: number
  stackBaseZ: number
  paperColor?: string
  isAnyDragging?: boolean
  onDragStateChange?: (isDragging: boolean) => void
  stackRestGap?: number
  stackSpreadMultiplier?: number
  position: [number, number]
  onDragDelta?: (delta: [number, number]) => void
}) {
  const geometry = useMemo(
    () =>
      createSheetWithStaggeredCircleHolesAlignedToSquareCenters(
        Math.min(GREEN_SHEET_WIDTH, GREEN_SHEET_HEIGHT),
        SQUARE_HOLES,
        SQUARE_HOLES,
        SQUARE_HALF,
        CIRCLE_SCALE
      ),
    []
  )
  const texture = useMemo(() => createPaperTexture(paperColor, 0.1), [paperColor])
  return (
    <DraggableSheet
      planeZ={stackBaseZ}
      stackIndex={stackIndex}
      stackRestGap={stackRestGap}
      stackSpreadMultiplier={stackSpreadMultiplier}
      isAnyDragging={isAnyDragging}
      onDragStateChange={onDragStateChange}
      onDragDelta={onDragDelta}
      geometry={geometry}
      color={paperColor}
      texture={texture}
      hitAreaSize={[GREEN_SHEET_WIDTH, GREEN_SHEET_HEIGHT]}
      position={position}
    />
  )
}

