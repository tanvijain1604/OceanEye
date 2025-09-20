import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { useI18n } from '../providers/I18nProvider'
import { useNotifications } from '../providers/NotificationProvider'
import { type UserRole, isValidRole } from '../utils/roles'
import { clearSession } from '../utils/auth'

export const Navbar: React.FC = () => {
  const { t } = useTranslation()
  const { currentLanguage, changeLanguage, availableLanguages } = useI18n()
  const { unreadCount } = useNotifications()
  const location = useLocation()
  const navigate = useNavigate()
  
  // State to hold authentication details, allowing for reactivity
  const [authState, setAuthState] = useState<{
    isAuthenticated: boolean
    userRole: UserRole | null
    userName: string
  }>({
    isAuthenticated: !!localStorage.getItem('oceaneye-user-id'),
    userRole: (localStorage.getItem('oceaneye-user-role') as UserRole) || null,
    userName: localStorage.getItem('oceaneye-user-name') || 'User',
  })

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  useEffect(() => {
    const handleStorageChange = () => {
      const newRole = localStorage.getItem('oceaneye-user-role')
      setAuthState({
        isAuthenticated: !!localStorage.getItem('oceaneye-user-id'),
        userRole: newRole && isValidRole(newRole) ? (newRole as UserRole) : null,
        userName: localStorage.getItem('oceaneye-user-name') || 'User',
      })
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const handleLogout = () => {
    clearSession()
    navigate('/')
    setIsUserMenuOpen(false)
  }

  const navItems = [
    { path: '/', label: t('nav.home'), public: true },
    { path: '/incois', label: t('nav.incois'), public: true },
    { path: '/precautions', label: t('nav.precautions'), public: true },
    { path: '/local-ngos', label: t('nav.local_ngos'), public: true },
    { path: '/evacuation-support', label: t('nav.evacuation'), public: true },
    { path: '/social', label: t('nav.social'), public: true },
  ]

  const { isAuthenticated, userRole, userName } = authState

  const dashboardPath = userRole ? `/dashboard/${userRole}` : '/login'

  return (
    <nav className="backdrop-blur-xl bg-white/50 border border-white/20 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 ocean-gradient rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">🌊</span>
            </div>
            <span className="text-xl font-bold text-primary-navy">OceanEye</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-3">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors !text-primary-navy border ${
                  location.pathname === item.path
                    ? 'text-primary-navy bg-white/70 border-white/60 shadow-sm'
                    : 'bg-white/30 border-white/40 hover:bg-white/60'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Right side controls */}
          <div className="flex items-center space-x-4">
            {/* Language Switcher */}
            <div className="relative">
              <select
                value={currentLanguage}
                onChange={(e) => changeLanguage(e.target.value)}
                className="bg-white/60 backdrop-blur border border-white/40 rounded-full px-3 py-1 text-sm !text-primary-navy focus:outline-none focus:ring-2 focus:ring-primary-ocean/30"
              >
                {availableLanguages.map((lang) => (
                  <option key={lang.code} value={lang.code} className="text-primary-navy">
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Notifications */}
            {isAuthenticated && (
              <div className="relative">
                <button
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className="relative p-2 rounded-full text-primary-navy/80 hover:text-primary-navy bg-white/30 hover:bg-white/50 transition-colors"
                >
                  <span className="text-xl">🔔</span>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-danger text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>
                
                <AnimatePresence>
                  {isNotificationsOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-80 glass-card p-4 shadow-xl z-50"
                    >
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="font-semibold text-primary-navy">Notifications</h3>
                        <button
                          onClick={() => setIsNotificationsOpen(false)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          ✕
                        </button>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">No new notifications</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 text-primary-navy/80 hover:text-primary-navy bg-white/30 hover:bg-white/50 rounded-full px-2 py-1 transition-colors"
                >
                  <div className="w-8 h-8 bg-primary-ocean rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:block text-sm font-medium">{userName}</span>
                  {userRole && (
                    <span className="text-xs text-gray-500">({t(`auth.role.${userRole}`)})</span>
                  )}
                </button>

                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-48 glass-card p-2 shadow-xl z-50"
                    >
                      <Link
                        to={dashboardPath}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-ocean/10 rounded-md transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        {t('nav.dashboard')}
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-primary-ocean/10 rounded-md transition-colors"
                      >
                        {t('nav.logout')}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-full !text-white !bg-primary-navy hover:!bg-primary-steel transition-colors"
                >
                  {t('nav.login')}
                </Link>
                <Link
                  to="/signup"
                  className="btn-primary !bg-primary-navy hover:!bg-primary-steel text-sm px-4 py-2"
                >
                  {t('nav.signup')}
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-full text-primary-navy/80 hover:text-primary-navy bg-white/30 hover:bg-white/50 transition-colors"
            >
              <span className="text-xl">☰</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-white/20 py-4 bg-white/50 backdrop-blur rounded-b-2xl"
            >
              <div className="space-y-2">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`block px-4 py-2 rounded-full text-sm font-medium transition-colors !text-primary-navy border ${
                      location.pathname === item.path
                        ? 'text-primary-navy bg-white/70 border-white/60 shadow-sm'
                        : 'bg-white/30 border-white/40 hover:bg-white/60'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  )
}
