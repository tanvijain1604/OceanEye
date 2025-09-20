  import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Button } from '../../components/Button'
import { Card } from '../../components/Card'
import type { UserRole } from '../../utils/roles'
import { login as apiLogin, persistSession, type StoredUser } from '../../utils/auth'

export const LoginPage: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
    role: 'citizen' as UserRole
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 600))

      if (!formData.identifier || !formData.password) {
        setError('Please fill in all fields')
        return
      }

      // Validate against backend first with local fallback
      const res = await apiLogin(formData.identifier, formData.password)
      if (!res.ok) {
        setError(res.error)
        return
      }

      // Persist session and honor selected role if mismatched
      const user = res.user
      const roleToUse: UserRole = user.role || formData.role
      const userToPersist: StoredUser = { ...user, role: roleToUse }
      persistSession(userToPersist)

      // Navigate to appropriate dashboard
      navigate(`/dashboard/${roleToUse}`)
    } catch (err) {
      setError('Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const roles: { value: UserRole; label: string; description: string }[] = [
    { 
      value: 'citizen', 
      label: t('auth.role.citizen'), 
      description: 'Access safety alerts, shelters, and incident reporting' 
    },
    { 
      value: 'official', 
      label: t('auth.role.official'), 
      description: 'Manage emergency response and resource allocation' 
    },
    { 
      value: 'analyst', 
      label: t('auth.role.analyst'), 
      description: 'Analyze trends and generate reports' 
    }
  ]

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4">
      <img
        src="/meow.png"
        alt="Ocean background"
        className="absolute inset-0 -z-20 w-full h-full object-cover"
      />
      <div className="absolute inset-0 -z-10 bg-primary-navy/20"></div>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <Card className="p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 ocean-gradient rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-2xl">🌊</span>
            </div>
            <h1 className="text-3xl font-bold text-primary-navy mb-2">
              {t('auth.login')}
            </h1>
            <p className="text-gray-600">
              Sign in to access your OceanEye dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-danger/10 border border-danger/20 text-danger px-4 py-3 rounded-lg"
              >
                {error}
              </motion.div>
            )}

            <div>
              <label htmlFor="identifier" className="block text-sm font-medium text-gray-700 mb-2">
                Email or Phone
              </label>
              <input
                type="text"
                id="identifier"
                name="identifier"
                value={formData.identifier}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-ocean focus:border-transparent transition-colors"
                placeholder="Enter your email or phone number"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth.password')}
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-ocean focus:border-transparent transition-colors"
                placeholder="Enter your password"
              />
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth.selectRole')}
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-ocean focus:border-transparent transition-colors"
              >
                {roles.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
              <p className="text-sm text-gray-500 mt-1">
                {roles.find(r => r.value === formData.role)?.description}
              </p>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              fullWidth
              className="text-lg py-4 bg-none !bg-primary-navy hover:!bg-primary-steel"
            >
              {t('auth.login')}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="text-primary-ocean hover:text-primary-steel font-medium transition-colors"
              >
                {t('auth.signup')}
              </Link>
            </p>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500 text-center">
              Use your registered email or phone with your password. New users: please sign up first.
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}

export default LoginPage
