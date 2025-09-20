import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Badge } from './Badge'

interface Alert {
  id: string
  type: 'urgent' | 'warning' | 'info'
  title: string
  message: string
  timestamp: string
  severity: 'critical' | 'high' | 'medium' | 'low'
}

interface AlertsTickerProps {
  alerts: Alert[]
  className?: string
  autoScroll?: boolean
  scrollSpeed?: number
}

export const AlertsTicker: React.FC<AlertsTickerProps> = ({
  alerts,
  className = '',
  autoScroll = true,
  scrollSpeed = 50
}) => {
  const { t } = useTranslation()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    if (!autoScroll || isPaused || alerts.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % alerts.length)
    }, scrollSpeed * 100)

    return () => clearInterval(interval)
  }, [autoScroll, isPaused, alerts.length, scrollSpeed])

  if (alerts.length === 0) {
    return (
      <div className={`glass-card p-4 ${className}`}>
        <div className="text-center text-gray-500">
          <span className="text-2xl mb-2 block">✅</span>
          <p>No active alerts</p>
        </div>
      </div>
    )
  }

  const currentAlert = alerts[currentIndex]

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'urgent': return '🚨'
      case 'warning': return '⚠️'
      case 'info': return 'ℹ️'
      default: return '📢'
    }
  }

  const getSeverityVariant = (severity: string) => {
    switch (severity) {
      case 'critical': return 'danger'
      case 'high': return 'danger'
      case 'medium': return 'warning'
      case 'low': return 'info'
      default: return 'default'
    }
  }

  return (
    <div 
      className={`glass-card p-4 ${className}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-primary-navy flex items-center">
          <span className="mr-2">{getAlertIcon(currentAlert.type)}</span>
          {t('citizen.alerts.title')}
        </h3>
        <div className="flex items-center space-x-2">
          <Badge 
            variant={getSeverityVariant(currentAlert.severity)}
            size="sm"
          >
            {currentAlert.severity.toUpperCase()}
          </Badge>
          {alerts.length > 1 && (
            <div className="flex space-x-1">
              {alerts.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentIndex ? 'bg-primary-ocean' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentAlert.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="space-y-2"
        >
          <h4 className="font-medium text-gray-900">{currentAlert.title}</h4>
          <p className="text-gray-700 text-sm">{currentAlert.message}</p>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{new Date(currentAlert.timestamp).toLocaleString()}</span>
            {alerts.length > 1 && (
              <span>{currentIndex + 1} of {alerts.length}</span>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {alerts.length > 1 && (
        <div className="flex justify-center mt-3">
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
              className="p-1 text-gray-400 hover:text-primary-ocean transition-colors"
              disabled={currentIndex === 0}
            >
              ←
            </button>
            <button
              onClick={() => setCurrentIndex(Math.min(alerts.length - 1, currentIndex + 1))}
              className="p-1 text-gray-400 hover:text-primary-ocean transition-colors"
              disabled={currentIndex === alerts.length - 1}
            >
              →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}


