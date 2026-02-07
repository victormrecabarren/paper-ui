import { useMemo } from 'react'
import { createPaperTexture } from '../utils/paperTexture'
import { createSheetWithCircleHoles } from '../utils/paperGeometries'
import { DraggableSheet } from './DraggableSheet'

const WHITE_SHEET_WIDTH = 1.8
const WHITE_SHEET_HEIGHT = 1.4
const CIRCLE_HOLES_COLS = 4
const CIRCLE_HOLES_ROWS = 3
const CIRCLE_RADIUS = 0.14
const Z_WHITE = 0.15

export function WhiteSheet() {
  const geometry = useMemo(
    () =>
      createSheetWithCircleHoles(
        WHITE_SHEET_WIDTH,
        WHITE_SHEET_HEIGHT,
        CIRCLE_HOLES_COLS,
        CIRCLE_HOLES_ROWS,
        CIRCLE_RADIUS
      ),
    []
  )
  const texture = useMemo(() => createPaperTexture('#f8f8f5', 0.1), [])
  return (
    <DraggableSheet
      planeZ={Z_WHITE}
      geometry={geometry}
      color="#f8f8f5"
      texture={texture}
      hitAreaSize={[WHITE_SHEET_WIDTH, WHITE_SHEET_HEIGHT]}
    />
  )
}
