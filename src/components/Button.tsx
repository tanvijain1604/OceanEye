import React, { useRef, useState } from 'react'
import { motion } from 'framer-motion'

interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onAnimationStart'> {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'danger' | 'safe' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  fullWidth?: boolean
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses = 'relative overflow-visible inline-flex items-center justify-center font-medium rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg backdrop-blur'
  
  const variantClasses = {
    primary: 'text-white bg-gradient-to-r from-[#15b2c9] to-[#42e3cf] focus:ring-teal-300',
    secondary: 'bg-white/80 text-slate-800 border border-white/40 hover:bg-white focus:ring-teal-300',
    danger: 'bg-danger hover:bg-red-600 text-white focus:ring-red-300',
    safe: 'bg-safe hover:bg-green-600 text-white focus:ring-green-300',
    // Outline buttons should be readable on light backgrounds (cards, glass)
    outline: 'border-2 border-primary-navy/40 text-primary-navy bg-white/70 hover:bg-white focus:ring-primary-ocean',
    // Ghost buttons should remain readable on light backgrounds
    ghost: 'text-primary-navy hover:bg-primary-ocean/10 focus:ring-primary-ocean'
  }

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  }

  const widthClasses = fullWidth ? 'w-full' : ''
  
  const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClasses} ${className}`

  // Extract onClick to ensure our animation handler runs and then delegates
  const { onClick: userOnClick, ...restProps } = props as any
  const btnRef = useRef<HTMLButtonElement>(null)
  const [droplets, setDroplets] = useState<Array<{ id: number; x: number; dx: number; dy: number; size: number }>>([])

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled && !loading && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect()
      const baseX = e.clientX - rect.left
      const count = 3 + Math.floor(Math.random() * 3)
      const baseId = Date.now()
      const newDrops = Array.from({ length: count }).map((_, i) => ({
        id: baseId + i,
        x: baseX + (Math.random() * 12 - 6),
        dx: Math.random() * 16 - 8,
        dy: -24 - Math.random() * 20,
        size: 3 + Math.random() * 3
      }))
      setDroplets((prev) => [...prev, ...newDrops])
    }
    // Delegate to user-provided onClick
    userOnClick?.(e)
  }

  return (
    <button
      ref={btnRef}
      className={combinedClasses}
      disabled={disabled || loading}
      onClick={handleClick}
      {...restProps}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      
      {!loading && icon && iconPosition === 'left' && (
        <span className="mr-2">{icon}</span>
      )}
      
      {children}
      
      {!loading && icon && iconPosition === 'right' && (
        <span className="ml-2">{icon}</span>
      )}

      {/* Water droplet micro-interaction */}
      {droplets.map((d) => (
        <motion.span
          key={d.id}
          className="pointer-events-none absolute"
          style={{ left: 0, top: '50%' }}
          initial={{ x: d.x, y: 0, opacity: 0.9, scale: 1 }}
          animate={{ x: d.x + d.dx, y: d.dy, opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          onAnimationComplete={() => setDroplets((prev) => prev.filter((p) => p.id !== d.id))}
        >
          <span
            style={{
              display: 'block',
              width: d.size,
              height: d.size,
              borderRadius: '9999px',
              background: 'rgba(255,255,255,0.85)',
              boxShadow: '0 0 6px rgba(255,255,255,0.5)',
              filter: 'blur(0.2px)'
            }}
          />
        </motion.span>
      ))}
    </button>
  )
}

interface ButtonGroupProps {
  children: React.ReactNode
  className?: string
  orientation?: 'horizontal' | 'vertical'
}

export const ButtonGroup: React.FC<ButtonGroupProps> = ({ 
  children, 
  className = '', 
  orientation = 'horizontal' 
}) => {
  const orientationClasses = orientation === 'horizontal' 
    ? 'flex flex-row space-x-2' 
    : 'flex flex-col space-y-2'

  return (
    <div className={`${orientationClasses} ${className}`}>
      {children}
    </div>
  )
}


