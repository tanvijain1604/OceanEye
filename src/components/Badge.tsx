import React from 'react'
import { motion } from 'framer-motion'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  icon?: React.ReactNode
  removable?: boolean
  onRemove?: () => void
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  icon,
  removable = false,
  onRemove
}) => {
  const baseClasses = 'inline-flex items-center font-medium rounded-full transition-all duration-200 backdrop-blur'
  
  const variantClasses = {
    default: 'bg-white/30 text-primary-navy border border-white/40',
    success: 'bg-white/30 text-safe border border-white/40',
    warning: 'bg-white/30 text-warning border border-white/40',
    danger: 'bg-white/30 text-danger border border-white/40',
    info: 'bg-white/30 text-primary-steel border border-white/40',
    outline: 'border border-white/60 text-white bg-transparent'
  }

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base'
  }
  
  const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`

  const MotionBadge = motion.span

  return (
    <MotionBadge
      className={combinedClasses}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.2 }}
    >
      {icon && <span className="mr-1">{icon}</span>}
      {children}
      {removable && (
        <button
          onClick={onRemove}
          className="ml-1 hover:bg-black/10 rounded-full p-0.5 transition-colors"
          aria-label="Remove badge"
        >
          <span className="text-xs">×</span>
        </button>
      )}
    </MotionBadge>
  )
}

interface StatusBadgeProps {
  status: 'pending' | 'approved' | 'rejected' | 'in_progress' | 'completed' | 'critical' | 'high' | 'medium' | 'low'
  className?: string
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const statusConfig = {
    pending: { variant: 'warning' as const, icon: '⏳', label: 'Pending' },
    approved: { variant: 'success' as const, icon: '✅', label: 'Approved' },
    rejected: { variant: 'danger' as const, icon: '❌', label: 'Rejected' },
    in_progress: { variant: 'info' as const, icon: '🔄', label: 'In Progress' },
    completed: { variant: 'success' as const, icon: '✅', label: 'Completed' },
    critical: { variant: 'danger' as const, icon: '🚨', label: 'Critical' },
    high: { variant: 'danger' as const, icon: '⚠️', label: 'High' },
    medium: { variant: 'warning' as const, icon: '⚡', label: 'Medium' },
    low: { variant: 'success' as const, icon: 'ℹ️', label: 'Low' }
  }

  const config = statusConfig[status] || statusConfig.pending

  return (
    <Badge
      variant={config.variant}
      icon={config.icon}
      className={className}
    >
      {config.label}
    </Badge>
  )
}


