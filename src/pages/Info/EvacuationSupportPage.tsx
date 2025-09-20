import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Card, CardContent } from '../../components/Card'
import { Button } from '../../components/Button'
import { Badge } from '../../components/Badge'
import { ShelterMap } from '../../components/MapView'
import { mockShelters, mockEvacuationRoutes } from '../../utils/map'

export const EvacuationSupportPage: React.FC = () => {
  const { t } = useTranslation()
  const [selectedTab, setSelectedTab] = useState<'routes' | 'shelters'>('routes')

  const evacuationTips = [
    {
      title: 'Plan Your Route',
      description: 'Know multiple evacuation routes from your location',
      icon: '🗺️',
      priority: 'high'
    },
    {
      title: 'Pack Emergency Kit',
      description: 'Keep a go-bag ready with essentials',
      icon: '🎒',
      priority: 'high'
    },
    {
      title: 'Stay Informed',
      description: 'Monitor official evacuation orders and updates',
      icon: '📻',
      priority: 'critical'
    },
    {
      title: 'Help Others',
      description: 'Assist elderly, disabled, or vulnerable neighbors',
      icon: '🤝',
      priority: 'medium'
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'success'
      case 'congested': return 'warning'
      case 'closed': return 'danger'
      default: return 'default'
    }
  }

  const getCapacityColor = (capacity: string) => {
    switch (capacity) {
      case 'high': return 'success'
      case 'medium': return 'warning'
      case 'low': return 'danger'
      default: return 'default'
    }
  }

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case 'critical': return 'danger'
      case 'high': return 'warning'
      case 'medium': return 'info'
      default: return 'default'
    }
  }

  return (
    <div className="min-h-screen bg-primary-foam py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            {t('evacuation.title')}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Find evacuation routes, emergency shelters, and essential information to keep you safe during emergencies.
          </p>
        </motion.div>

        {/* Evacuation Tips */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-white mb-8 text-center">
            Evacuation Guidelines
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {evacuationTips.map((tip, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 + index * 0.1 }}
              >
                <Card hover className="h-full">
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl mb-4">{tip.icon}</div>
                    <h3 className="text-lg font-semibold text-primary-navy mb-3">
                      {tip.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                      {tip.description}
                    </p>
                    <Badge variant={getPriorityVariant(tip.priority)} size="sm">
                      {tip.priority.toUpperCase()}
                    </Badge>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex justify-center">
            <div className="bg-white/50 backdrop-blur rounded-full p-1 border border-white/40">
              <button
                onClick={() => setSelectedTab('routes')}
                className={`px-6 py-3 rounded-full font-medium transition-all ${
                  selectedTab === 'routes'
                    ? 'bg-primary-ocean text-white shadow-lg'
                    : 'text-primary-navy hover:bg-white/50'
                }`}
              >
                {t('evacuation.routes')}
              </button>
              <button
                onClick={() => setSelectedTab('shelters')}
                className={`px-6 py-3 rounded-full font-medium transition-all ${
                  selectedTab === 'shelters'
                    ? 'bg-primary-ocean text-white shadow-lg'
                    : 'text-primary-navy hover:bg-white/50'
                }`}
              >
                {t('evacuation.shelters')}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Content based on selected tab */}
        {selectedTab === 'routes' && (
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            {/* Evacuation Routes List */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-2xl font-bold text-primary-navy mb-6">
                  Current Evacuation Routes
                </h3>
                <div className="space-y-4">
                  {mockEvacuationRoutes.map((route) => (
                    <div key={route.data.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="text-lg font-semibold text-primary-navy">
                            {route.data.name}
                          </h4>
                          <p className="text-sm text-gray-600">
                            Route ID: {route.data.id}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Badge variant={getStatusColor(route.data.status)} size="sm">
                            {route.data.status.toUpperCase()}
                          </Badge>
                          <Badge variant={getCapacityColor(route.data.capacity)} size="sm">
                            {route.data.capacity.toUpperCase()} CAPACITY
                          </Badge>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-600">
                          <span>📍 Coordinates: {route.lat.toFixed(3)}, {route.lng.toFixed(3)}</span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const url = `https://www.google.com/maps/dir/?api=1&destination=${route.lat},${route.lng}`
                            window.open(url, '_blank')
                          }}
                        >
                          Open in Maps
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Route Planning Tips */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-primary-navy mb-4">
                  Route Planning Tips
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-primary-navy mb-2">✅ Do:</h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li>• Plan multiple routes from your location</li>
                      <li>• Practice your evacuation route regularly</li>
                      <li>• Keep your vehicle fueled and ready</li>
                      <li>• Know the locations of emergency shelters</li>
                      <li>• Stay updated on route conditions</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-danger mb-2">❌ Don't:</h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li>• Wait for the last minute to evacuate</li>
                      <li>• Take shortcuts through unknown areas</li>
                      <li>• Drive through flooded roads</li>
                      <li>• Ignore official evacuation orders</li>
                      <li>• Leave without your emergency kit</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.section>
        )}

        {selectedTab === 'shelters' && (
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            {/* Shelters Map */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-2xl font-bold text-primary-navy mb-6">
                  Emergency Shelters Map
                </h3>
                <ShelterMap shelters={mockShelters} />
              </CardContent>
            </Card>

            {/* Shelters List */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-2xl font-bold text-primary-navy mb-6">
                  Available Emergency Shelters
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {mockShelters.map((shelter) => (
                    <div key={shelter.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-semibold text-primary-navy">
                          {shelter.name}
                        </h4>
                        <Badge 
                          variant={shelter.currentOccupancy / shelter.capacity > 0.8 ? 'warning' : 'success'} 
                          size="sm"
                        >
                          {shelter.currentOccupancy}/{shelter.capacity}
                        </Badge>
                      </div>
                      <div className="space-y-2 text-sm text-gray-600 mb-4">
                        <div>📍 {shelter.address}</div>
                        <div>📞 {shelter.contact}</div>
                        <div>👥 Capacity: {shelter.capacity}</div>
                        <div>🏠 Available: {shelter.capacity - shelter.currentOccupancy}</div>
                      </div>
                      <div className="mb-4">
                        <div className="text-sm font-medium text-gray-700 mb-2">Facilities:</div>
                        <div className="flex flex-wrap gap-1">
                          {shelter.facilities.map((facility, index) => (
                            <Badge key={index} variant="outline" size="sm">
                              {facility}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <Button
                        variant="primary"
                        size="sm"
                        fullWidth
                        onClick={() => {
                          const url = `https://www.google.com/maps/dir/?api=1&destination=${shelter.lat},${shelter.lng}`
                          window.open(url, '_blank')
                        }}
                      >
                        Get Directions
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.section>
        )}

        {/* Emergency Contacts */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16"
        >
          <Card className="p-8">
            <h2 className="text-2xl font-bold text-primary-navy mb-6 text-center">
              Emergency Contacts
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl mb-2">🚨</div>
                <div className="font-semibold text-lg">Emergency</div>
                <div className="text-primary-ocean font-mono">100</div>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">🏥</div>
                <div className="font-semibold text-lg">Medical</div>
                <div className="text-primary-ocean font-mono">108</div>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">🔥</div>
                <div className="font-semibold text-lg">Fire</div>
                <div className="text-primary-ocean font-mono">101</div>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">👮</div>
                <div className="font-semibold text-lg">Police</div>
                <div className="text-primary-ocean font-mono">100</div>
              </div>
            </div>
          </Card>
        </motion.section>
      </div>
    </div>
  )
}

export default EvacuationSupportPage