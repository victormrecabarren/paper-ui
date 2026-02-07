import { useMemo } from 'react'
import { createPaperTexture } from '../utils/paperTexture'
import { createSheetWithCircleHoles } from '../utils/paperGeometries'
import { POS_GREEN_SHEET, Z_GREEN_SHEET } from '../constants/layers'
import { DraggableSheet } from './DraggableSheet'

const GREEN_SHEET_WIDTH = 1.8
const GREEN_SHEET_HEIGHT = 1.8
const CIRCLE_HOLES_COLS = 4
const CIRCLE_HOLES_ROWS = 4
const CIRCLE_RADIUS = 0.14

export function GreenSheet({
  isAnyDragging,
  onDragStateChange,
  stackRestGap,
  stackSpreadMultiplier,
}: {
  isAnyDragging?: boolean
  onDragStateChange?: (isDragging: boolean) => void
  stackRestGap?: number
  stackSpreadMultiplier?: number
}) {
  const geometry = useMemo(
    () =>
      createSheetWithCircleHoles(
        GREEN_SHEET_WIDTH,
        GREEN_SHEET_HEIGHT,
        CIRCLE_HOLES_COLS,
        CIRCLE_HOLES_ROWS,
        CIRCLE_RADIUS
      ),
    []
  )
  const texture = useMemo(() => createPaperTexture('#47B36A', 0.1), [])
  return (
    <DraggableSheet
      planeZ={Z_GREEN_SHEET}
      stackIndex={3}
      stackRestGap={stackRestGap}
      stackSpreadMultiplier={stackSpreadMultiplier}
      isAnyDragging={isAnyDragging}
      onDragStateChange={onDragStateChange}
      geometry={geometry}
      color="#47B36A"
      texture={texture}
      hitAreaSize={[GREEN_SHEET_WIDTH, GREEN_SHEET_HEIGHT]}
      initialPosition={POS_GREEN_SHEET}
    />
  )
}

