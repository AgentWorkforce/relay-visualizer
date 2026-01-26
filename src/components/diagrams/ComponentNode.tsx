import { motion } from 'framer-motion'
import { ReactNode } from 'react'

export interface Position {
  x: number
  y: number
}

export interface ComponentNodeProps {
  label: string
  icon?: ReactNode
  position: Position
  onClick?: () => void
  variant?: 'default' | 'primary' | 'secondary' | 'accent'
  size?: 'sm' | 'md' | 'lg'
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
    minWidth: 'min-w-[120px]',
    iconSize: 'w-5 h-5',
    textSize: 'text-sm',
  },
  lg: {
    padding: 'px-6 py-4',
    minWidth: 'min-w-[160px]',
    iconSize: 'w-6 h-6',
    textSize: 'text-base',
  },
}

export function ComponentNode({
  label,
  icon,
  position,
  onClick,
  variant = 'default',
  size = 'md',
}: ComponentNodeProps) {
  const styles = variantStyles[variant]
  const sizes = sizeStyles[size]

  return (
    <motion.div
      className={`
        absolute cursor-pointer select-none
        ${sizes.padding} ${sizes.minWidth}
        ${styles.bg} ${styles.border} ${styles.text}
        border-2 rounded-xl
        flex flex-col items-center justify-center gap-2
        backdrop-blur-sm
        transition-colors duration-200
      `}
      style={{
        left: position.x,
        top: position.y,
        transform: 'translate(-50%, -50%)',
      }}
      onClick={onClick}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{
        scale: 1.08,
        boxShadow: `0 0 20px ${styles.glow}, 0 0 40px ${styles.glow}`,
      }}
      whileTap={{ scale: 0.95 }}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 25,
      }}
    >
      {icon && (
        <div className={`${sizes.iconSize} flex items-center justify-center`}>
          {icon}
        </div>
      )}
      <span className={`${sizes.textSize} font-semibold text-center whitespace-nowrap`}>
        {label}
      </span>
    </motion.div>
  )
}
