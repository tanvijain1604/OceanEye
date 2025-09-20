import React from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Card, CardContent } from '../../components/Card'
import { Button } from '../../components/Button'
import { Badge } from '../../components/Badge'

export const PrecautionsPage: React.FC = () => {
  const { t } = useTranslation()

  const precautions = {
    before: [
      {
        title: 'Stay Informed',
        description: 'Monitor weather forecasts and ocean conditions regularly',
        icon: '📡',
        priority: 'high'
      },
      {
        title: 'Prepare Emergency Kit',
        description: 'Keep essential supplies ready including food, water, and first aid',
        icon: '🎒',
        priority: 'high'
      },
      {
        title: 'Know Evacuation Routes',
        description: 'Familiarize yourself with local evacuation routes and shelters',
        icon: '🗺️',
        priority: 'high'
      },
      {
        title: 'Secure Property',
        description: 'Secure outdoor furniture and loose items that could become projectiles',
        icon: '🔒',
        priority: 'medium'
      }
    ],
    during: [
      {
        title: 'Stay Indoors',
        description: 'Remain inside a sturdy building away from windows and doors',
        icon: '🏠',
        priority: 'critical'
      },
      {
        title: 'Avoid Flooded Areas',
        description: 'Never walk or drive through flooded streets or areas',
        icon: '🚫',
        priority: 'critical'
      },
      {
        title: 'Listen to Authorities',
        description: 'Follow instructions from emergency management officials',
        icon: '📢',
        priority: 'critical'
      },
      {
        title: 'Stay Connected',
        description: 'Keep your phone charged and stay connected to emergency updates',
        icon: '📱',
        priority: 'high'
      }
    ],
    after: [
      {
        title: 'Wait for All Clear',
        description: 'Only return home when authorities declare it safe to do so',
        icon: '✅',
        priority: 'high'
      },
      {
        title: 'Check for Damage',
        description: 'Inspect your property for damage and report any hazards',
        icon: '🔍',
        priority: 'high'
      },
      {
        title: 'Avoid Contaminated Water',
        description: 'Do not use tap water until authorities confirm it is safe',
        icon: '💧',
        priority: 'critical'
      },
      {
        title: 'Help Others',
        description: 'Check on neighbors and help those who may need assistance',
        icon: '🤝',
        priority: 'medium'
      }
    ]
  }

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case 'critical': return 'danger'
      case 'high': return 'warning'
      case 'medium': return 'info'
      default: return 'default'
    }
  }

  const downloadChecklist = () => {
    // Build a simple text checklist from the on-page data and trigger download
    const lines: string[] = []
    lines.push('Ocean Emergency Preparedness Checklist')
    lines.push('------------------------------------')
    lines.push(`Generated: ${new Date().toLocaleString()}`)
    lines.push('')

    const addSection = (title: string, items: { title: string; description: string }[]) => {
      lines.push(title)
      lines.push('-'.repeat(title.length))
      items.forEach(item => {
        lines.push(` [ ] ${item.title} — ${item.description}`)
      })
      lines.push('')
    }

    addSection(t('precautions.before'), precautions.before)
    addSection(t('precautions.during'), precautions.during)
    addSection(t('precautions.after'), precautions.after)

    // Emergency contacts
    lines.push('Emergency Contacts')
    lines.push('------------------')
    lines.push(' Emergency: 100')
    lines.push(' Medical: 108')
    lines.push(' Fire: 101')
    lines.push(' Police: 100')
    lines.push('')

    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'ocean_emergency_checklist.txt'
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
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
            {t('precautions.title')}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Essential safety guidelines to help you prepare for, respond to, and recover from ocean-related emergencies.
          </p>
          <Button
            variant="primary"
            size="lg"
            onClick={downloadChecklist}
            icon="📥"
          >
            {t('precautions.checklist')}
          </Button>
        </motion.div>

        {/* Before Emergency */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-white mb-8 text-center">
            {t('precautions.before')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {precautions.before.map((precaution, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 + index * 0.1 }}
              >
                <Card hover className="h-full">
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl mb-4">{precaution.icon}</div>
                    <h3 className="text-lg font-semibold text-primary-navy mb-3">
                      {precaution.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                      {precaution.description}
                    </p>
                    <Badge variant={getPriorityVariant(precaution.priority)} size="sm">
                      {precaution.priority.toUpperCase()}
                    </Badge>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* During Emergency */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-white mb-8 text-center">
            {t('precautions.during')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {precautions.during.map((precaution, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
              >
                <Card hover className="h-full">
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl mb-4">{precaution.icon}</div>
                    <h3 className="text-lg font-semibold text-primary-navy mb-3">
                      {precaution.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                      {precaution.description}
                    </p>
                    <Badge variant={getPriorityVariant(precaution.priority)} size="sm">
                      {precaution.priority.toUpperCase()}
                    </Badge>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* After Emergency */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-white mb-8 text-center">
            {t('precautions.after')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {precautions.after.map((precaution, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
              >
                <Card hover className="h-full">
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl mb-4">{precaution.icon}</div>
                    <h3 className="text-lg font-semibold text-primary-navy mb-3">
                      {precaution.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                      {precaution.description}
                    </p>
                    <Badge variant={getPriorityVariant(precaution.priority)} size="sm">
                      {precaution.priority.toUpperCase()}
                    </Badge>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Emergency Contacts */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center"
        >
          <Card className="p-8">
            <h2 className="text-2xl font-bold text-primary-navy mb-6">
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

export default PrecautionsPage
