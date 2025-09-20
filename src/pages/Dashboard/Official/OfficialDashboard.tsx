import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Card, CardContent } from '../../../components/Card'
import { Button } from '../../../components/Button'
import { Badge, StatusBadge } from '../../../components/Badge'
import { Modal, ConfirmModal } from '../../../components/Modal'
import { ResourceChart } from '../../../components/Chart'
import { NearestResources } from '../../../components/NearestResources'
import { IncidentMap } from '../../../components/MapView'
import { mockIncidents } from '../../../utils/map'
import { mockResourceData } from '../../../utils/charts'
import { useReports } from '../../../providers/ReportsProvider'

export const OfficialDashboard: React.FC = () => {
  const { t } = useTranslation()
  const [, setSelectedIncident] = useState<any>(null)
  const [showResourceModal, setShowResourceModal] = useState(false)
  const [showAlertModal, setShowAlertModal] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [confirmAction] = useState<(() => void) | null>(null)

  const incidents = mockIncidents
  const resources = mockResourceData
  const { reports, updateStatus, updatePriority } = useReports()
        
  // Reserved handlers for future moderation actions (kept for UX hooks)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  
  const handleSendAlert = () => {
    // In a real app, this would send alerts to citizens
    alert('Zone alert sent successfully!')
    setShowAlertModal(false)
  }

  const handleResourceUpdate = (resourceId: string, newCount: number) => {
    // In a real app, this would update resource counts
    alert(`Resource ${resourceId} updated to ${newCount}`)
    setShowResourceModal(false)
  }

  // Helpers for Report Incident (Official Quick Action)
  
  
  
  
  return (
    <div className="relative min-h-screen py-8">
      <img
        src="/meow.png"
        alt="Ocean background"
        className="absolute inset-0 -z-20 w-full h-full object-cover"
      />
      <div className="absolute inset-0 -z-10 bg-primary-navy/20"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">
            {t('dashboard.title.official')}
          </h1>
          <p className="text-gray-600">
            {t('dashboard.welcome')}, {localStorage.getItem('oceaneye-user-name') || 'Official'}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Incident Moderation (Citizen Reports) */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold text-primary-navy mb-4">
                    {t('official.moderation.title')}
                  </h2>
                  <div className="space-y-4">
                    {reports.filter(r => r.status === 'pending').map((r) => (
                      <div key={r.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-semibold text-primary-navy capitalize">{r.type}</h3>
                            <p className="text-sm text-gray-600">{r.location}</p>
                          </div>
                          <Badge variant="warning" size="sm">Pending</Badge>
                        </div>
                        <div className="text-sm text-gray-700 mb-3 whitespace-pre-wrap">{r.description}</div>
                        {!!r.photoDataUrl && (
                          <img src={r.photoDataUrl} alt="report" className="max-h-48 rounded mb-3" />
                        )}
                        <div className="flex justify-between items-center">
                          <div className="text-xs text-gray-500">
                            Reported by {r.reporterName || r.reporterId} • {new Date(r.timestamp).toLocaleString()}
                            {typeof r.lat === 'number' && typeof r.lng === 'number' && (
                              <span> • Coords: {r.lat.toFixed(3)}, {r.lng.toFixed(3)}</span>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="safe" size="sm" onClick={() => updateStatus(r.id, 'approved')}>
                              {t('official.moderation.approve')}
                            </Button>
                            <Button variant="danger" size="sm" onClick={() => updateStatus(r.id, 'rejected')}>
                              {t('official.moderation.reject')}
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setSelectedIncident(r)}>
                              {t('official.moderation.review')}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {reports.filter(r => r.status === 'pending').length === 0 && (
                      <div className="text-center text-gray-500 py-8">
                        <span className="text-4xl mb-4 block">✅</span>
                        <p>No pending citizen reports to review</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Approved Reports with Priority Management */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold text-primary-navy mb-4">
                    Approved Reports
                  </h2>

                  <div className="space-y-4">
                    {reports.filter(r => r.status === 'approved').map((r) => (
                      <div key={r.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-semibold text-primary-navy capitalize">{r.type}</h3>
                            <p className="text-sm text-gray-600">{r.location}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <StatusBadge status={r.priority} />
                            <StatusBadge status={r.status} />
                          </div>
                        </div>
                        <div className="text-sm text-gray-700 mb-3 whitespace-pre-wrap">{r.description}</div>
                        {!!r.photoDataUrl && (
                          <img src={r.photoDataUrl} alt="report" className="max-h-48 rounded mb-3" />
                        )}
                        <div className="flex justify-between items-center">
                          <div className="text-xs text-gray-500">
                            Reported by {r.reporterName || r.reporterId} • {new Date(r.timestamp).toLocaleString()}
                            {typeof r.lat === 'number' && typeof r.lng === 'number' && (
                              <span> • Coords: {r.lat.toFixed(3)}, {r.lng.toFixed(3)}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <label className="text-sm text-gray-700">Priority:</label>
                            <select
                              value={r.priority}
                              onChange={(e) => updatePriority(r.id, e.target.value as any)}
                              className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-primary-ocean focus:border-transparent"
                            >
                              <option value="low">Low</option>
                              <option value="medium">Medium</option>
                              <option value="high">High</option>
                              <option value="critical">Critical</option>
                            </select>
                            <Button variant="outline" size="sm" onClick={() => updateStatus(r.id, 'pending')}>
                              Move to Pending
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {reports.filter(r => r.status === 'approved').length === 0 && (
                      <div className="text-center text-gray-500 py-8">
                        <span className="text-4xl mb-4 block">📭</span>
                        <p>No approved reports yet</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Resource Manager */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-primary-navy">
                      {t('official.resources.title')}
                    </h2>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setShowResourceModal(true)}
                    >
                      {t('official.resources.adjust')}
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                      <ResourceChart data={resources} />
                    </div>
                    <div>
                      <NearestResources />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Incident Map */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold text-primary-navy mb-4">
                    Incident Locations
                  </h2>
                  <IncidentMap incidents={incidents} />
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold text-primary-navy mb-4">
                    Quick Actions
                  </h2>
                  <div className="space-y-3">
                                        <Button
                      variant="danger"
                      fullWidth
                      onClick={() => setShowAlertModal(true)}
                      icon="📢"
                    >
                      {t('official.pushAlert.title')}
                    </Button>
                    <Button
                      variant="primary"
                      fullWidth
                      icon="📊"
                      onClick={() => alert('View Analytics coming soon!')}
                    >
                      View Analytics
                    </Button>
                    <Button
                      variant="secondary"
                      fullWidth
                      icon="👥"
                      onClick={() => alert('Manage Teams coming soon!')}
                    >
                      Manage Teams
                    </Button>
                    <Button
                      variant="outline"
                      fullWidth
                      icon="📋"
                      onClick={() => alert('Generate Report coming soon!')}
                    >
                      Generate Report
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Task Assignment */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold text-primary-navy mb-4">
                    {t('official.tasks.title')}
                  </h2>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-sm">Flood Response Team</div>
                        <div className="text-xs text-gray-500">High Priority</div>
                      </div>
                      <Badge variant="warning" size="sm">In Progress</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-sm">Resource Distribution</div>
                        <div className="text-xs text-gray-500">Medium Priority</div>
                      </div>
                      <Badge variant="info" size="sm">Assigned</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-sm">Shelter Management</div>
                        <div className="text-xs text-gray-500">Low Priority</div>
                      </div>
                      <Badge variant="success" size="sm">Completed</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* System Status */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold text-primary-navy mb-4">
                    System Status
                  </h2>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Alert System</span>
                      <Badge variant="success" size="sm">Online</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">GPS Tracking</span>
                      <Badge variant="success" size="sm">Online</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Communication</span>
                      <Badge variant="success" size="sm">Online</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Database</span>
                      <Badge variant="warning" size="sm">Slow</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        
        {/* Push Alert Modal */}
        <Modal
          isOpen={showAlertModal}
          onClose={() => setShowAlertModal(false)}
          title={t('official.pushAlert.title')}
          size="md"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('official.pushAlert.selectZone')}
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-ocean focus:border-transparent">
                <option>North Zone</option>
                <option>South Zone</option>
                <option>East Zone</option>
                <option>West Zone</option>
                <option>Central Zone</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('official.pushAlert.message')}
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-ocean focus:border-transparent"
                rows={3}
                placeholder="Enter alert message..."
              />
            </div>
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowAlertModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleSendAlert}
              >
                {t('official.pushAlert.send')}
              </Button>
            </div>
          </div>
        </Modal>

        {/* Resource Update Modal */}
        <Modal
          isOpen={showResourceModal}
          onClose={() => setShowResourceModal(false)}
          title="Update Resource Count"
          size="md"
        >
          <div className="space-y-4">
            {resources.map((resource) => (
              <div key={resource.name} className="flex justify-between items-center p-3 border border-gray-200 rounded-lg">
                <div>
                  <div className="font-medium">{resource.name}</div>
                  <div className="text-sm text-gray-500">Available: {resource.available}</div>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    defaultValue={resource.available}
                    className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleResourceUpdate(resource.name, resource.available)}
                  >
                    Update
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Modal>

        {/* Confirm Modal */}
        <ConfirmModal
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={() => confirmAction?.()}
          title="Confirm Action"
          message="Are you sure you want to proceed with this action?"
          confirmText="Confirm"
          cancelText="Cancel"
        />
      </div>
    </div>
  )
}

export default OfficialDashboard
