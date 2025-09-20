import React, { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '../../../components/Card'
import { Button } from '../../../components/Button'
import { Badge } from '../../../components/Badge'
import { AlertsTicker } from '../../../components/AlertsTicker'
import { ShelterMap } from '../../../components/MapView'
import HotspotMap from '../../../components/HotspotMap'
import NearestShelters from '../../../components/NearestShelters'
import { WeatherChart } from '../../../components/Chart'
import { Modal } from '../../../components/Modal'
import { mockShelters } from '../../../utils/map'
import { mockWeatherData } from '../../../utils/charts'
import { useLocation } from '../../../providers/LocationProvider'
import { useReports } from '../../../providers/ReportsProvider'

// TODO: Replace with a proper toast notification provider
const showToast = (message: string) => alert(message)

export const CitizenDashboard: React.FC = () => {
  const { t } = useTranslation()
  const { coords, locateOnce } = useLocation()
  const [showReportModal, setShowReportModal] = useState(false)
  const [reportData, setReportData] = useState({
    type: '',
    description: '',
    location: '',
    photo: null as File | null,
    video: null as File | null,
    comments: ''
  })
  const { submitReport, reports } = useReports()
  const [submitting, setSubmitting] = useState(false)

  const alerts = [
    {
      id: '1',
      type: 'urgent' as const,
      title: 'Tsunami Warning',
      message: 'High alert: Tsunami warning issued for coastal areas. Evacuate immediately.',
      timestamp: new Date().toISOString(),
      severity: 'critical' as const
    },
    {
      id: '2',
      type: 'warning' as const,
      title: 'Heavy Rain Alert',
      message: 'Heavy rainfall expected in the next 2 hours. Stay indoors.',
      timestamp: new Date(Date.now() - 300000).toISOString(),
      severity: 'high' as const
    }
  ]

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    // Convert photo to data URL for local persistence
    let photoDataUrl: string | undefined
    if (reportData.photo) {
      photoDataUrl = await fileToDataUrl(reportData.photo)
    }
    // Convert video to data URL for local persistence
    let videoDataUrl: string | undefined
    if (reportData.video) {
      try {
        videoDataUrl = await fileToDataUrl(reportData.video)
      } catch (_) {
        // ignore video conversion errors
      }
    }
    submitReport({
      type: reportData.type,
      description: reportData.description,
      location: reportData.location,
      photoDataUrl,
      videoDataUrl,
      commentsText: reportData.comments,
      reporterName: localStorage.getItem('oceaneye-user-name') || 'User',
      lat: coords?.lat,
      lng: coords?.lng,
    })
    showToast('Incident report submitted successfully!')
    setShowReportModal(false)
    setReportData({ type: '', description: '', location: '', photo: null, video: null, comments: '' })
    setSubmitting(false)
  }

  const [weather, setWeather] = useState<{ temp?: number; humidity?: number; wind?: number; time?: string } | null>(null)
  const [weatherLoading, setWeatherLoading] = useState(false)
  const [weatherError, setWeatherError] = useState<string | null>(null)
  
  const fallbackCenter = useMemo(() => ({ lat: 12.9716, lng: 77.5946 }), [])

  useEffect(() => {
    const { lat, lng } = coords || fallbackCenter
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,wind_speed_10m&timezone=auto`
    setWeatherLoading(true)
    setWeatherError(null)
    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error(`${r.status} ${r.statusText}`)
        return r.json()
      })
      .then((data) => {
        const c = data?.current || {}
        setWeather({
          temp: c.temperature_2m,
          humidity: c.relative_humidity_2m,
          wind: c.wind_speed_10m,
          time: c.time
        })
      })
      .catch((e) => setWeatherError(e?.message || 'Failed to load weather'))
      .finally(() => setWeatherLoading(false))
  }, [coords, fallbackCenter])

  const fileToDataUrl = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setReportData(prev => ({ ...prev, photo: file }))
    }
  }

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setReportData(prev => ({ ...prev, video: file }))
    }
  }

  const handleUseCurrentLocation = async () => {
    if (!coords) {
      await locateOnce()
    }
    if (coords) {
      setReportData(prev => ({ ...prev, location: `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}` }))
    } else {
      showToast('Could not get current location.')
    }
  }

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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            {t('dashboard.title.citizen')}
          </h1>
          <p className="text-gray-600">
            {t('dashboard.welcome')}, {localStorage.getItem('oceaneye-user-name') || 'User'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Safety Alerts */}
            <div>
              <AlertsTicker alerts={alerts} />
            </div>

            {/* Weather Brief */}
            <div>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-primary-navy">
                      {t('citizen.weather.title')}
                    </h2>
                    <Button size="sm" variant="outline" onClick={locateOnce}>Use My Location</Button>
                  </div>
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg text-sm">
                    {weatherLoading && (<div className="text-gray-600">Loading local weather…</div>)}
                    {!weatherLoading && weatherError && (<div className="text-red-600">{weatherError}</div>)}
                    {!weatherLoading && !weatherError && weather && (
                      <div className="flex flex-wrap gap-4 items-center">
                        <div>
                          <span className="text-gray-500">Location:</span>{' '}
                          <span className="font-mono">{(coords?.lat ?? fallbackCenter.lat).toFixed(3)}, {(coords?.lng ?? fallbackCenter.lng).toFixed(3)}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Temp:</span>{' '}
                          <span className="font-semibold">{Math.round(weather.temp ?? 0)}°C</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Humidity:</span>{' '}
                          <span className="font-semibold">{Math.round(weather.humidity ?? 0)}%</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Wind:</span>{' '}
                          <span className="font-semibold">{Math.round(weather.wind ?? 0)} km/h</span>
                        </div>
                        <div className="text-gray-500">as of {weather.time ? new Date(weather.time).toLocaleString() : 'now'}</div>
                      </div>
                    )}
                  </div>
                  <WeatherChart data={mockWeatherData} />
                </CardContent>
              </Card>
            </div>

            {/* Real-time Hotspots */}
            <div>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-primary-navy">Real-time Hotspots</h2>
                  </div>
                  <HotspotMap height="520px" />
                </CardContent>
              </Card>
            </div>

            {/* Nearby Shelters Map */}
            <div>
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold text-primary-navy mb-4">
                    {t('citizen.shelters.title')}
                  </h2>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                      <ShelterMap shelters={mockShelters} />
                    </div>
                    <div>
                      <NearestShelters />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Quick Actions */}
            <div>
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold text-primary-navy mb-4">
                    Quick Actions
                  </h2>
                  <div className="space-y-3">
                    <Button
                      variant="danger"
                      fullWidth
                      onClick={() => setShowReportModal(true)}
                      icon="🚨"
                    >
                      {t('citizen.report.title')}
                    </Button>
                    <Button
                      variant="primary"
                      fullWidth
                      icon="🏠"
                      onClick={() => alert('Find Nearest Shelter coming soon!')}
                    >
                      Find Nearest Shelter
                    </Button>
                    <Button
                      variant="secondary"
                      fullWidth
                      icon="📱"
                      onClick={() => alert('Emergency Contacts coming soon!')}
                    >
                      Emergency Contacts
                    </Button>
                    <Button
                      variant="outline"
                      fullWidth
                      icon="📋"
                      onClick={() => alert('Safety Checklist coming soon!')}
                    >
                      Safety Checklist
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Reports */}
            <div>
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold text-primary-navy mb-4">
                    My Reports
                  </h2>
                  <div className="space-y-3">
                    {reports.slice(0, 5).map((r) => (
                      <div key={r.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium text-sm capitalize">{r.type}</div>
                          <div className="text-xs text-gray-500">{new Date(r.timestamp).toLocaleString()}</div>
                          <div className="text-xs text-gray-600 line-clamp-2 max-w-xs">{r.description}</div>
                        </div>
                        <Badge variant={r.status === 'approved' ? 'success' : r.status === 'rejected' ? 'danger' : 'warning'} size="sm">
                          {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                        </Badge>
                      </div>
                    ))}
                    {reports.length === 0 && (
                      <div className="text-center text-gray-500 py-4 text-sm">No reports submitted yet.</div>
                    )}
                    <div className="text-center text-gray-500 text-sm">
                      <Button variant="ghost" size="sm">
                        View All Reports
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Emergency Contacts */}
            <div>
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold text-primary-navy mb-4">
                    Emergency Contacts
                  </h2>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Emergency</span>
                      <span className="font-mono text-primary-ocean">100</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Medical</span>
                      <span className="font-mono text-primary-ocean">108</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Fire</span>
                      <span className="font-mono text-primary-ocean">101</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Police</span>
                      <span className="font-mono text-primary-ocean">100</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Incident Report Modal */}
        <Modal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          title={t('citizen.report.title')}
          size="md"
        >
          <form onSubmit={handleReportSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('citizen.report.type')}
              </label>
              <select
                value={reportData.type}
                onChange={(e) => setReportData(prev => ({ ...prev, type: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-ocean focus:border-transparent"
                required
              >
                <option value="">Select incident type</option>
                <option value="tsunamis">Tsunamis</option>
                <option value="storm-surges">Storm Surges</option>
                <option value="high-waves">High Waves</option>
                <option value="swell-surges">Swell Surges</option>
                <option value="coastal-currents">Coastal Currents</option>
                <option value="others">Others</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('citizen.report.description')}
              </label>
              <textarea
                value={reportData.description}
                onChange={(e) => setReportData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-ocean focus:border-transparent"
                rows={3}
                placeholder="Describe the incident in detail..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('citizen.report.location')}
              </label>
              <input
                type="text"
                value={reportData.location}
                onChange={(e) => setReportData(prev => ({ ...prev, location: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-ocean focus:border-transparent"
                placeholder="Enter the location of the incident"
                required
              />
              <div className="mt-2 text-right">
                <Button size="sm" variant="outline" type="button" onClick={handleUseCurrentLocation}>
                  Use Current Location
                </Button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('citizen.report.photo')}
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-ocean focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Video Upload
              </label>
              <input
                type="file"
                accept="video/*"
                onChange={handleVideoUpload}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-ocean focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Comments
              </label>
              <textarea
                value={reportData.comments}
                onChange={(e) => setReportData(prev => ({ ...prev, comments: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-ocean focus:border-transparent"
                rows={2}
                placeholder="Add any additional comments..."
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowReportModal(false)}
                disabled={submitting}
              >
                {t('common.actions.cancel')}
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : t('common.actions.submit')}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  )
}

export default CitizenDashboard
