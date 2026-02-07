import { useMemo } from 'react'
import { createPaperTexture } from '../utils/paperTexture'
import { createSheetWithStaggeredCircleHolesAlignedToSquareCenters } from '../utils/paperGeometries'
import { DraggableSheet } from './DraggableSheet'

const WHITE_SHEET_WIDTH = 3.6
const WHITE_SHEET_HEIGHT = 3.6
// Match the square sheet's grid so patterns align.
const SQUARE_HOLES = 6
const SQUARE_HALF = 0.22
const CIRCLE_SCALE = 0.62

export function WhiteSheet({
  stackIndex,
  stackBaseZ,
  paperColor = '#f8f8f5',
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
        Math.min(WHITE_SHEET_WIDTH, WHITE_SHEET_HEIGHT),
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
      hitAreaSize={[WHITE_SHEET_WIDTH, WHITE_SHEET_HEIGHT]}
      position={position}
    />
  )
}
