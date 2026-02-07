import { useMemo } from 'react'
import { createPaperTexture } from '../utils/paperTexture'
import { createSheetWithSquareHoles } from '../utils/paperGeometries'
import { POS_ORANGE_SHEET, Z_ORANGE_SHEET } from '../constants/layers'
import { DraggableSheet } from './DraggableSheet'

const ORANGE_SHEET_WIDTH = 1.8
const ORANGE_SHEET_HEIGHT = 1.8
const SQUARE_HOLES = 3
const SQUARE_HALF = 0.22

export function OrangeSheet({
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
      createSheetWithSquareHoles(
        ORANGE_SHEET_WIDTH,
        ORANGE_SHEET_HEIGHT,
        SQUARE_HOLES,
        SQUARE_HOLES,
        SQUARE_HALF
      ),
    []
  )
  const texture = useMemo(() => createPaperTexture('#F2A245', 0.08), [])
  return (
    <DraggableSheet
      planeZ={Z_ORANGE_SHEET}
      stackIndex={0}
      stackRestGap={stackRestGap}
      stackSpreadMultiplier={stackSpreadMultiplier}
      isAnyDragging={isAnyDragging}
      onDragStateChange={onDragStateChange}
      geometry={geometry}
      color="#F2A245"
      texture={texture}
      hitAreaSize={[ORANGE_SHEET_WIDTH, ORANGE_SHEET_HEIGHT]}
      initialPosition={POS_ORANGE_SHEET}
    />
  )
}

