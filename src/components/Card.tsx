import React from 'react'
import { motion } from 'framer-motion'

interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  onClick?: () => void
  variant?: 'default' | 'glass' | 'elevated'
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  hover = false, 
  onClick,
  variant = 'default'
}) => {
  const baseClasses = 'rounded-2xl transition-all duration-200 backdrop-blur'
  
  const variantClasses = {
    default: 'bg-white/80 border border-white/50 shadow-sm',
    glass: 'glass-card',
    elevated: 'bg-white/90 shadow-xl border border-white/60'
  }

  const hoverClasses = hover ? 'hover:shadow-xl hover:-translate-y-1 cursor-pointer' : ''
  const clickableClasses = onClick ? 'cursor-pointer' : ''

  const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${hoverClasses} ${clickableClasses} ${className}`

  const MotionCard = motion.div

  return (
    <MotionCard
      className={combinedClasses}
      onClick={onClick}
      whileHover={hover ? { y: -4, scale: 1.02 } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </MotionCard>
  )
}

interface CardHeaderProps {
  children: React.ReactNode
  className?: string
}

export const CardHeader: React.FC<CardHeaderProps> = ({ children, className = '' }) => (
  <div className={`p-6 pb-4 ${className}`}>
    {children}
  </div>
)

interface CardContentProps {
  children: React.ReactNode
  className?: string
}

export const CardContent: React.FC<CardContentProps> = ({ children, className = '' }) => (
  <div className={`px-6 pb-6 ${className}`}>
    {children}
  </div>
)

interface CardFooterProps {
  children: React.ReactNode
  className?: string
}

export const CardFooter: React.FC<CardFooterProps> = ({ children, className = '' }) => (
  <div className={`px-6 py-4 pt-0 ${className}`}>
    {children}
  </div>
)


