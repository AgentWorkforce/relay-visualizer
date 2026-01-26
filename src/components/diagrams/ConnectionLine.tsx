import { motion } from 'framer-motion'
import { useMemo } from 'react'
import type { Position } from './ComponentNode'
import { generatePath } from './utils'

export interface ConnectionLineProps {
  start: Position
  end: Position
  animated?: boolean
  curved?: boolean
  color?: string
  strokeWidth?: number
  dashArray?: string
  animationDuration?: number
  bidirectional?: boolean
}

export function ConnectionLine({
  start,
  end,
  animated = false,
  curved = false,
  color = '#64748b',
  strokeWidth = 2,
  dashArray = '8,4',
  animationDuration = 1,
  bidirectional = false,
}: ConnectionLineProps) {
  const pathD = useMemo(
    () => generatePath(start, end, curved),
    [start, end, curved]
  )

  // Calculate path length for animation
  const pathLength = useMemo(() => {
    const dx = end.x - start.x
    const dy = end.y - start.y
    return Math.sqrt(dx * dx + dy * dy) * (curved ? 1.2 : 1)
  }, [start, end, curved])

  return (
    <svg
      className="absolute inset-0 pointer-events-none overflow-visible"
      style={{ width: '100%', height: '100%' }}
    >
      <defs>
        {/* Gradient for bidirectional lines */}
        <linearGradient
          id={`gradient-${start.x}-${start.y}-${end.x}-${end.y}`}
          x1={start.x}
          y1={start.y}
          x2={end.x}
          y2={end.y}
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor={color} stopOpacity={0.3} />
          <stop offset="50%" stopColor={color} stopOpacity={1} />
          <stop offset="100%" stopColor={color} stopOpacity={0.3} />
        </linearGradient>

        {/* Arrow marker */}
        <marker
          id={`arrow-${color.replace('#', '')}`}
          markerWidth="10"
          markerHeight="10"
          refX="9"
          refY="3"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path
            d="M0,0 L0,6 L9,3 z"
            fill={color}
          />
        </marker>
      </defs>

      {/* Background static line */}
      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeOpacity={0.2}
      />

      {/* Animated dashed line */}
      {animated ? (
        <motion.path
          d={pathD}
          fill="none"
          stroke={bidirectional ? `url(#gradient-${start.x}-${start.y}-${end.x}-${end.y})` : color}
          strokeWidth={strokeWidth}
          strokeDasharray={dashArray}
          strokeLinecap="round"
          initial={{ strokeDashoffset: pathLength }}
          animate={{ strokeDashoffset: [pathLength, -pathLength] }}
          transition={{
            duration: animationDuration,
            ease: 'linear',
            repeat: Infinity,
          }}
        />
      ) : (
        <path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={dashArray}
          strokeLinecap="round"
        />
      )}
    </svg>
  )
}
