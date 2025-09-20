import React from 'react'
import { Navigate } from 'react-router-dom'
import { type UserRole, isValidRole } from '../../utils/roles'

interface RoleGuardProps {
  children: React.ReactNode
  allowedRoles: UserRole[]
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ children, allowedRoles }) => {
  const userRole = localStorage.getItem('oceaneye-user-role')
  const isAuthenticated = localStorage.getItem('oceaneye-user-id') !== null

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // If role is invalid, treat as unauthenticated
  if (!userRole || !isValidRole(userRole)) {
    return <Navigate to="/login" replace />
  }

  // If authenticated but not allowed for this route, send to user's own dashboard
  if (!allowedRoles.includes(userRole as UserRole)) {
    return <Navigate to={`/dashboard/${userRole}`} replace />
  }

  return <>{children}</>
}
