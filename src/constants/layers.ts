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

// Background is one "gap" below the bottom sheet.
export const Z_BACKGROUND_LAYER = Z_SHEET_BASE - STACK_GAP_REST

/**
 * Initial XY positions.
 * All start directly on top of each other (no offset).
 */
export const POS_ORANGE_SHEET: [number, number] = [0, 0]
export const POS_WHITE_SHEET: [number, number] = [0, 0]
export const POS_NAVY_SHEET: [number, number] = [0, 0]
export const POS_GREEN_SHEET: [number, number] = [0, 0]

/**
 * Stack-drag behavior:
 * Dragging any sheet drags the whole stack, but the top layer moves most,
 * then progressively less for layers below (creating a "spread" over time).
 */
export const STACK_DRAG_FALLOFF = 0.75

