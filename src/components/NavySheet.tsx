import { useMemo } from 'react'
import { createPaperTexture } from '../utils/paperTexture'
import { createSheetWithSquareHoles } from '../utils/paperGeometries'
import { DraggableSheet } from './DraggableSheet'

const NAVY_SHEET_WIDTH = 3.6
const NAVY_SHEET_HEIGHT = 3.6
const SQUARE_HOLES = 6
const SQUARE_HALF = 0.22

export function NavySheet({
  stackIndex,
  stackBaseZ,
  paperColor = '#376AB2',
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
      createSheetWithSquareHoles(
        NAVY_SHEET_WIDTH,
        NAVY_SHEET_HEIGHT,
        SQUARE_HOLES,
        SQUARE_HOLES,
        SQUARE_HALF
      ),
    []
  )
  const texture = useMemo(() => createPaperTexture(paperColor, 0.08), [paperColor])
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
      hitAreaSize={[NAVY_SHEET_WIDTH, NAVY_SHEET_HEIGHT]}
      position={position}
    />
  )
}
