import { useMemo } from 'react'
import { createPaperTexture } from '../utils/paperTexture'
import { createSheetWithSquareHoles } from '../utils/paperGeometries'
import { DraggableSheet } from './DraggableSheet'

const NAVY_SHEET_WIDTH = 1.8
const NAVY_SHEET_HEIGHT = 1.8
const SQUARE_HOLES = 3
const SQUARE_HALF = 0.22
const Z_NAVY = 0.35

export function NavySheet() {
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
  const texture = useMemo(() => createPaperTexture('#376AB2', 0.08), [])
  return (
    <DraggableSheet
      planeZ={Z_NAVY}
      geometry={geometry}
      color="#376AB2"
      texture={texture}
      hitAreaSize={[NAVY_SHEET_WIDTH, NAVY_SHEET_HEIGHT]}
    />
  )
}
