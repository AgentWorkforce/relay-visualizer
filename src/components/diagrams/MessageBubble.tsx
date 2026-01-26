import { motion } from 'framer-motion'
import { ReactNode, useId } from 'react'

export interface MessageBubbleProps {
  path: string
  duration?: number
  delay?: number
  color?: string
  size?: 'sm' | 'md' | 'lg'
  label?: string
  icon?: ReactNode
  loop?: boolean
  onComplete?: () => void
}

const sizeConfig = {
  sm: {
    width: 16,
    height: 16,
    fontSize: 'text-[8px]',
    iconSize: 'w-2 h-2',
  },
  md: {
    width: 24,
    height: 24,
    fontSize: 'text-[10px]',
    iconSize: 'w-3 h-3',
  },
  lg: {
    width: 36,
    height: 36,
    fontSize: 'text-xs',
    iconSize: 'w-4 h-4',
  },
}

export function MessageBubble({
  path,
  duration = 2,
  delay = 0,
  color = '#3b82f6',
  size = 'md',
  label,
  icon,
  loop = true,
  onComplete,
}: MessageBubbleProps) {
  const uniqueId = useId()
  const pathId = `message-path-${uniqueId}`
  const sizeProps = sizeConfig[size]

  return (
    <svg
      className="absolute inset-0 pointer-events-none overflow-visible"
      style={{ width: '100%', height: '100%' }}
    >
      <defs>
        {/* Define the path for the motion */}
        <path id={pathId} d={path} fill="none" />

        {/* Glow filter */}
        <filter id={`glow-${uniqueId}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* The animated bubble */}
      <motion.g
        initial={{ offsetDistance: '0%', opacity: 0 }}
        animate={{ offsetDistance: '100%', opacity: [0, 1, 1, 0] }}
        transition={{
          duration,
          delay,
          ease: 'linear',
          repeat: loop ? Infinity : 0,
          repeatDelay: loop ? 0.5 : 0,
          times: [0, 0.1, 0.9, 1],
        }}
        onAnimationComplete={() => {
          if (!loop && onComplete) {
            onComplete()
          }
        }}
        style={{
          offsetPath: `path("${path}")`,
          offsetRotate: '0deg',
        }}
      >
        {/* Outer glow */}
        <circle
          cx={0}
          cy={0}
          r={sizeProps.width / 2 + 4}
          fill={color}
          opacity={0.2}
          filter={`url(#glow-${uniqueId})`}
        />

        {/* Main bubble */}
        <circle
          cx={0}
          cy={0}
          r={sizeProps.width / 2}
          fill={color}
          stroke="white"
          strokeWidth={1.5}
        />

        {/* Inner highlight */}
        <circle
          cx={-sizeProps.width / 6}
          cy={-sizeProps.width / 6}
          r={sizeProps.width / 6}
          fill="white"
          opacity={0.4}
        />

        {/* Label or icon (using foreignObject for text/React elements) */}
        {(label || icon) && (
          <foreignObject
            x={-sizeProps.width / 2}
            y={-sizeProps.height / 2}
            width={sizeProps.width}
            height={sizeProps.height}
          >
            <div
              className="w-full h-full flex items-center justify-center text-white font-bold"
              style={{ fontSize: sizeProps.fontSize }}
            >
              {icon ? (
                <div className={sizeProps.iconSize}>{icon}</div>
              ) : (
                <span className="truncate px-0.5">{label}</span>
              )}
            </div>
          </foreignObject>
        )}
      </motion.g>
    </svg>
  )
}

// Envelope icon component for message visualization
export function EnvelopeIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="currentColor"
      viewBox="0 0 20 20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
    </svg>
  )
}

// Pulse animation variant for stationary messages
export function MessagePulse({
  position,
  color = '#3b82f6',
  size = 'md',
}: {
  position: { x: number; y: number }
  color?: string
  size?: 'sm' | 'md' | 'lg'
}) {
  const sizeProps = sizeConfig[size]

  return (
    <motion.div
      className="absolute flex items-center justify-center"
      style={{
        left: position.x,
        top: position.y,
        width: sizeProps.width,
        height: sizeProps.height,
        transform: 'translate(-50%, -50%)',
      }}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
    >
      {/* Pulsing rings */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: sizeProps.width,
          height: sizeProps.height,
          backgroundColor: color,
        }}
        animate={{
          scale: [1, 2],
          opacity: [0.5, 0],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeOut',
        }}
      />

      {/* Main dot */}
      <div
        className="rounded-full border-2 border-white"
        style={{
          width: sizeProps.width,
          height: sizeProps.height,
          backgroundColor: color,
        }}
      />
    </motion.div>
  )
}
