import { useMemo } from 'react'
import { createPaperTexture } from '../utils/paperTexture'
import { createSheetWithSquareHoles } from '../utils/paperGeometries'
import { DraggableSheet } from './DraggableSheet'

const ORANGE_SHEET_WIDTH = 3.6
const ORANGE_SHEET_HEIGHT = 3.6
const SQUARE_HOLES = 6
const SQUARE_HALF = 0.22

export function OrangeSheet({
  stackIndex,
  stackBaseZ,
  paperColor = '#F2A245',
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
        ORANGE_SHEET_WIDTH,
        ORANGE_SHEET_HEIGHT,
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
      hitAreaSize={[ORANGE_SHEET_WIDTH, ORANGE_SHEET_HEIGHT]}
      position={position}
    />
  )
}

