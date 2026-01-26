import { motion } from 'framer-motion'
import { ReactNode, KeyboardEvent } from 'react'

export interface Position {
  x: number
  y: number
}

export interface ComponentNodeProps {
  label: string
  icon?: ReactNode
  position: Position
  onClick?: () => void
  onKeyDown?: (e: KeyboardEvent) => void
  variant?: 'default' | 'primary' | 'secondary' | 'accent'
  size?: 'sm' | 'md' | 'lg'
  ariaLabel?: string
}

const variantStyles = {
  default: {
    bg: 'bg-slate-800',
    border: 'border-slate-600',
    glow: 'rgba(100, 116, 139, 0.5)',
    text: 'text-slate-200',
  },
  primary: {
    bg: 'bg-blue-900/80',
    border: 'border-blue-500',
    glow: 'rgba(59, 130, 246, 0.6)',
    text: 'text-blue-100',
  },
  secondary: {
    bg: 'bg-purple-900/80',
    border: 'border-purple-500',
    glow: 'rgba(168, 85, 247, 0.6)',
    text: 'text-purple-100',
  },
  accent: {
    bg: 'bg-emerald-900/80',
    border: 'border-emerald-500',
    glow: 'rgba(16, 185, 129, 0.6)',
    text: 'text-emerald-100',
  },
}

const sizeStyles = {
  sm: {
    padding: 'px-3 py-2',
    minWidth: 'min-w-[80px]',
    iconSize: 'w-4 h-4',
    textSize: 'text-xs',
  },
  md: {
    padding: 'px-4 py-3',
    minWidth: 'min-w-[100px] md:min-w-[120px]',
    iconSize: 'w-5 h-5',
    textSize: 'text-xs md:text-sm',
  },
  lg: {
    padding: 'px-4 py-3 md:px-6 md:py-4',
    minWidth: 'min-w-[100px] md:min-w-[160px]',
    iconSize: 'w-5 h-5 md:w-6 md:h-6',
    textSize: 'text-xs md:text-base',
  },
}

export function ComponentNode({
  label,
  icon,
  position,
  onClick,
  onKeyDown,
  variant = 'default',
  size = 'md',
  ariaLabel,
}: ComponentNodeProps) {
  const styles = variantStyles[variant]
  const sizes = sizeStyles[size]
  const isInteractive = !!onClick

  return (
    <motion.button
      type="button"
      className={`
        absolute select-none
        ${sizes.padding} ${sizes.minWidth}
        ${styles.bg} ${styles.border} ${styles.text}
        border-2 rounded-xl
        flex flex-col items-center justify-center gap-1 md:gap-2
        backdrop-blur-sm
        transition-colors duration-200
        focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900
        ${isInteractive ? 'cursor-pointer' : 'cursor-default'}
      `}
      style={{
        left: position.x,
        top: position.y,
        transform: 'translate(-50%, -50%)',
      }}
      onClick={onClick}
      onKeyDown={onKeyDown}
      aria-label={ariaLabel || label}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={isInteractive ? {
        scale: 1.08,
        boxShadow: `0 0 20px ${styles.glow}, 0 0 40px ${styles.glow}`,
      } : undefined}
      whileTap={isInteractive ? { scale: 0.95 } : undefined}
      whileFocus={{
        boxShadow: `0 0 0 2px rgba(59, 130, 246, 1)`,
      }}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 25,
      }}
    >
      {icon && (
        <div className={`${sizes.iconSize} flex items-center justify-center`} aria-hidden="true">
          {icon}
        </div>
      )}
      <span className={`${sizes.textSize} font-semibold text-center whitespace-nowrap`}>
        {label}
      </span>
    </motion.button>
  )
}
