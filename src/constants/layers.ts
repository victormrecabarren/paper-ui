/**
 * Layer stacking + spacing in one place.
 *
 * You generally only tweak:
 * - `STACK_GAP_REST`: spacing between layers at rest
 * - `STACK_GAP_DRAG`: spacing between layers while dragging (subtle lift/spread)
 *
 * Z positions are derived so you can see the exact deltas.
 */

// How far apart adjacent layers sit at rest.
export const STACK_GAP_REST = 0.03

// How far apart adjacent layers spread while dragging.
export const STACK_GAP_DRAG = 0.045 // 1.5x of rest gap by default

// Internally we animate a multiplier (1 -> STACK_SPREAD_MULTIPLIER).
export const STACK_SPREAD_MULTIPLIER =
  STACK_GAP_REST > 0 ? STACK_GAP_DRAG / STACK_GAP_REST : 1

// Base Z for the bottom paper layer.
export const Z_SHEET_BASE = 0.07

// Layer Zs (resting). These show the exact deltas in one place.
// Background is one "gap" below the bottom sheet.
export const Z_BACKGROUND_LAYER = Z_SHEET_BASE - STACK_GAP_REST
export const Z_ORANGE_SHEET = Z_SHEET_BASE
export const Z_WHITE_SHEET = Z_SHEET_BASE + STACK_GAP_REST
export const Z_NAVY_SHEET = Z_SHEET_BASE + STACK_GAP_REST * 2
export const Z_GREEN_SHEET = Z_SHEET_BASE + STACK_GAP_REST * 3

/**
 * Initial XY offsets so you can see layers on page load.
 * "Up + left" means (-x, +y). Each higher stack index gets one more step.
 */
export const STACK_OFFSET_STEP: [number, number] = [-0.07, 0.07]

export const POS_ORANGE_SHEET: [number, number] = [0, 0]
export const POS_WHITE_SHEET: [number, number] = [
  POS_ORANGE_SHEET[0] + STACK_OFFSET_STEP[0],
  POS_ORANGE_SHEET[1] + STACK_OFFSET_STEP[1],
]
export const POS_NAVY_SHEET: [number, number] = [
  POS_ORANGE_SHEET[0] + STACK_OFFSET_STEP[0] * 2,
  POS_ORANGE_SHEET[1] + STACK_OFFSET_STEP[1] * 2,
]
export const POS_GREEN_SHEET: [number, number] = [
  POS_ORANGE_SHEET[0] + STACK_OFFSET_STEP[0] * 3,
  POS_ORANGE_SHEET[1] + STACK_OFFSET_STEP[1] * 3,
]

