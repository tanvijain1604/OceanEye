import React, { createContext, useContext, useState, useEffect } from 'react'
import { type Notification, getNotificationsForRole, showNotification } from '../utils/notifications'
import type { UserRole } from '../utils/roles'

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void
  removeNotification: (id: string) => void
  clearAllNotifications: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [userRole, setUserRole] = useState<UserRole | null>(null)

  useEffect(() => {
    // Get user role from localStorage
    const role = localStorage.getItem('oceaneye-user-role')
    if (role && (role === 'citizen' || role === 'official' || role === 'analyst')) {
      setUserRole(role)
      const roleNotifications = getNotificationsForRole(role)
      setNotifications(roleNotifications)
    }
  }, [])

  useEffect(() => {
    // Listen for role changes
    const handleStorageChange = () => {
      const newRole = localStorage.getItem('oceaneye-user-role')
      if (newRole !== userRole) {
        const role = (newRole && (newRole === 'citizen' || newRole === 'official' || newRole === 'analyst')) ? newRole : null
        setUserRole(role)
        if (role) {
          const roleNotifications = getNotificationsForRole(role)
          setNotifications(roleNotifications)
        } else {
          setNotifications([])
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [userRole])

  const unreadCount = notifications.filter(n => !n.read).length

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    )
  }

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date()
    }
    
    setNotifications(prev => [newNotification, ...prev])
    
    // Show toast notification
    showNotification(
      notification.type,
      notification.title,
      notification.message
    )
  }

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id))
  }

  const clearAllNotifications = () => {
    setNotifications([])
  }

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      markAsRead,
      markAllAsRead,
      addNotification,
      removeNotification,
      clearAllNotifications
    }}>
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}
