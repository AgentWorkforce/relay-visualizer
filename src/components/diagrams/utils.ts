import type { Position } from './ComponentNode'

/**
 * Generates an SVG path string between two points
 * @param start - Starting position
 * @param end - Ending position
 * @param curved - Whether to generate a curved path
 * @returns SVG path string
 */
export function generatePath(
  start: Position,
  end: Position,
  curved: boolean
): string {
  if (!curved) {
    return `M ${start.x} ${start.y} L ${end.x} ${end.y}`
  }

  // Create a curved path using quadratic bezier
  const midX = (start.x + end.x) / 2
  const midY = (start.y + end.y) / 2

  // Calculate perpendicular offset for the control point
  const dx = end.x - start.x
  const dy = end.y - start.y
  const distance = Math.sqrt(dx * dx + dy * dy)

  // Curve intensity based on distance
  const curveOffset = Math.min(distance * 0.2, 50)

  // Perpendicular direction
  const perpX = -dy / distance
  const perpY = dx / distance

  const controlX = midX + perpX * curveOffset
  const controlY = midY + perpY * curveOffset

  return `M ${start.x} ${start.y} Q ${controlX} ${controlY} ${end.x} ${end.y}`
}

/**
 * Utility function to get path string for external use (e.g., MessageBubble)
 */
export function getConnectionPath(
  start: Position,
  end: Position,
  curved: boolean = false
): string {
  return generatePath(start, end, curved)
}
