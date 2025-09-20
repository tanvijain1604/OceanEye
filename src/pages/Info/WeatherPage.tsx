import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Card, CardContent } from '../../components/Card'
import { Button } from '../../components/Button'
import { Badge } from '../../components/Badge'
import { WeatherChart } from '../../components/Chart'
import { useLocation } from '../../providers/LocationProvider'
import { Modal } from '../../components/Modal'
import { useReports } from '../../providers/ReportsProvider'

export const WeatherPage: React.FC = () => {
  const { t } = useTranslation()
  const { coords, locateOnce } = useLocation()
  const { submitReport } = useReports()

  const [weather, setWeather] = useState<any>(null)
  const [forecast, setForecast] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [showReportModal, setShowReportModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [reportData, setReportData] = useState({
    type: '',
    description: '',
    location: '',
    photo: null as File | null,
    video: null as File | null,
    comments: ''
  })

  const mockCurrentWeather = {
    location: 'Chennai, Tamil Nadu',
    temperature: 32,
    condition: 'Partly Cloudy',
    humidity: 68,
    windSpeed: 15,
    windDirection: 'SW',
    pressure: 1013,
    visibility: 10,
    uvIndex: 7,
    feelsLike: 36,
    icon: '⛅'
  }

  const mockForecast = [
    { day: 'Today', high: 32, low: 26, condition: 'Partly Cloudy', icon: '⛅', rain: 20 },
    { day: 'Tomorrow', high: 30, low: 25, condition: 'Thunderstorms', icon: '⛈️', rain: 80 },
    { day: 'Wednesday', high: 28, low: 24, condition: 'Heavy Rain', icon: '🌧️', rain: 90 },
    { day: 'Thursday', high: 29, low: 25, condition: 'Light Rain', icon: '🌦️', rain: 60 },
    { day: 'Friday', high: 31, low: 26, condition: 'Sunny', icon: '☀️', rain: 10 },
    { day: 'Saturday', high: 33, low: 27, condition: 'Partly Cloudy', icon: '⛅', rain: 30 },
    { day: 'Sunday', high: 34, low: 28, condition: 'Sunny', icon: '☀️', rain: 5 }
  ]

  const oceanConditions = {
    waveHeight: 2.1,
    waveDirection: 'SW',
    seaTemperature: 28,
    tideHigh: '14:30',
    tideLow: '20:45',
    currentSpeed: 0.8,
    visibility: 8
  }

  const alerts = [
    {
      type: 'warning',
      title: 'High Wave Warning',
      message: 'Waves up to 3.5m expected along the coast. Avoid water activities.',
      validUntil: '2024-01-15 18:00'
    },
    {
      type: 'info',
      title: 'Monsoon Update',
      message: 'Southwest monsoon expected to arrive in 2-3 days.',
      validUntil: '2024-01-20 12:00'
    }
  ]

  useEffect(() => {
    // Simulate loading weather data
    setLoading(true)
    setTimeout(() => {
      setWeather(mockCurrentWeather)
      setForecast(mockForecast)
      setLoading(false)
    }, 1000)
  }, [])

  const fetchWeatherForLocation = async () => {
    if (!coords) {
      locateOnce()
      return
    }

    setLoading(true)
    setError(null)

    try {
      // In a real app, this would call a weather API
      // For demo, we'll simulate with mock data
      await new Promise(resolve => setTimeout(resolve, 1000))
      setWeather({
        ...mockCurrentWeather,
        location: `${coords.lat.toFixed(2)}, ${coords.lng.toFixed(2)}`
      })
      setForecast(mockForecast)
    } catch (err) {
      setError('Failed to fetch weather data')
    } finally {
      setLoading(false)
    }
  }

  const getAlertVariant = (type: string) => {
    switch (type) {
      case 'warning': return 'warning'
      case 'danger': return 'danger'
      case 'info': return 'info'
      default: return 'default'
    }
  }

  const getConditionColor = (condition: string) => {
    if (condition.includes('Rain') || condition.includes('Storm')) return 'text-blue-600'
    if (condition.includes('Sunny')) return 'text-yellow-500'
    if (condition.includes('Cloud')) return 'text-gray-500'
    return 'text-gray-700'
  }

  const fileToDataUrl = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setReportData(prev => ({ ...prev, photo: file }))
  }

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setReportData(prev => ({ ...prev, video: file }))
  }

  const handleUseCurrentLocation = async () => {
    if (!coords) await locateOnce()
    if (coords) {
      setReportData(prev => ({ ...prev, location: `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}` }))
    } else {
      alert('Could not get current location.')
    }
  }

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    let photoDataUrl: string | undefined
    if (reportData.photo) photoDataUrl = await fileToDataUrl(reportData.photo)
    let videoDataUrl: string | undefined
    if (reportData.video) {
      try { videoDataUrl = await fileToDataUrl(reportData.video) } catch {}
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
    alert('Incident report submitted successfully!')
    setShowReportModal(false)
    setReportData({ type: '', description: '', location: '', photo: null, video: null, comments: '' })
    setSubmitting(false)
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
          <h1 className="text-4xl md:text-5xl font-bold text-primary-navy mb-6">
            Weather & Ocean Conditions
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Stay informed with real-time weather updates and ocean conditions for coastal safety.
          </p>
          <Button
            variant="primary"
            onClick={fetchWeatherForLocation}
            loading={loading}
            icon="📍"
          >
            Get Weather for My Location
          </Button>
        </motion.div>

        {/* Weather Alerts */}
        {alerts.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-16"
          >
            <h2 className="text-2xl font-bold text-primary-navy mb-6">Active Alerts</h2>
            <div className="space-y-4">
              {alerts.map((alert, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 + index * 0.1 }}
                >
                  <Card className={`border-l-4 ${
                    alert.type === 'warning' ? 'border-l-warning' : 
                    alert.type === 'danger' ? 'border-l-danger' : 'border-l-primary-ocean'
                  }`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge variant={getAlertVariant(alert.type)} size="sm">
                              {alert.type.toUpperCase()}
                            </Badge>
                            <h3 className="font-semibold text-primary-navy">{alert.title}</h3>
                          </div>
                          <p className="text-gray-700 mb-2">{alert.message}</p>
                          <p className="text-sm text-gray-500">Valid until: {alert.validUntil}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Current Weather */}
          <div className="lg:col-span-2 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold text-primary-navy mb-6">Current Conditions</h2>
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin w-8 h-8 border-4 border-primary-ocean border-t-transparent rounded-full mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading weather data...</p>
                    </div>
                  ) : error ? (
                    <div className="text-center py-8">
                      <p className="text-red-600 mb-4">{error}</p>
                      <Button variant="outline" onClick={fetchWeatherForLocation}>
                        Try Again
                      </Button>
                    </div>
                  ) : weather ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="text-center">
                        <div className="text-6xl mb-4">{weather.icon}</div>
                        <div className="text-4xl font-bold text-primary-navy mb-2">
                          {weather.temperature}°C
                        </div>
                        <div className={`text-lg ${getConditionColor(weather.condition)} mb-2`}>
                          {weather.condition}
                        </div>
                        <div className="text-sm text-gray-600">
                          Feels like {weather.feelsLike}°C
                        </div>
                        <div className="text-sm text-gray-600 mt-2">
                          📍 {weather.location}
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Humidity</span>
                          <span className="font-semibold">{weather.humidity}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Wind</span>
                          <span className="font-semibold">{weather.windSpeed} km/h {weather.windDirection}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Pressure</span>
                          <span className="font-semibold">{weather.pressure} hPa</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Visibility</span>
                          <span className="font-semibold">{weather.visibility} km</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">UV Index</span>
                          <Badge variant={weather.uvIndex > 6 ? 'warning' : 'success'} size="sm">
                            {weather.uvIndex}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            </motion.div>

            {/* 7-Day Forecast */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold text-primary-navy mb-6">7-Day Forecast</h2>
                  <div className="space-y-4">
                    {forecast.map((day, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="text-2xl">{day.icon}</div>
                          <div>
                            <div className="font-semibold text-primary-navy">{day.day}</div>
                            <div className={`text-sm ${getConditionColor(day.condition)}`}>
                              {day.condition}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-sm text-gray-600">
                            💧 {day.rain}%
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">{day.high}°</div>
                            <div className="text-sm text-gray-600">{day.low}°</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Weather Chart */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <WeatherChart />
            </motion.div>
          </div>

          {/* Ocean Conditions */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold text-primary-navy mb-4">
                    Ocean Conditions
                  </h2>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Wave Height</span>
                      <span className="font-semibold">{oceanConditions.waveHeight}m</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Wave Direction</span>
                      <span className="font-semibold">{oceanConditions.waveDirection}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Sea Temperature</span>
                      <span className="font-semibold">{oceanConditions.seaTemperature}°C</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Current Speed</span>
                      <span className="font-semibold">{oceanConditions.currentSpeed} m/s</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Visibility</span>
                      <span className="font-semibold">{oceanConditions.visibility} km</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Tide Information */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold text-primary-navy mb-4">
                    Tide Times
                  </h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">🌊</span>
                        <span className="font-semibold text-blue-700">High Tide</span>
                      </div>
                      <span className="font-mono text-blue-700">{oceanConditions.tideHigh}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">🏖️</span>
                        <span className="font-semibold text-gray-700">Low Tide</span>
                      </div>
                      <span className="font-mono text-gray-700">{oceanConditions.tideLow}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Safety Recommendations */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold text-primary-navy mb-4">
                    Safety Recommendations
                  </h2>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-2">
                      <span className="text-green-500 mt-1">✅</span>
                      <span className="text-sm text-gray-700">Beach activities are safe during low tide</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="text-yellow-500 mt-1">⚠️</span>
                      <span className="text-sm text-gray-700">Moderate wave conditions - exercise caution</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="text-red-500 mt-1">❌</span>
                      <span className="text-sm text-gray-700">Avoid deep water activities due to high waves</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold text-primary-navy mb-4">
                    Quick Actions
                  </h2>
                  <div className="space-y-3">
                    <Button variant="danger" fullWidth icon="🚨" onClick={() => setShowReportModal(true)}>
                      {t('citizen.report.title')}
                    </Button>
                    <Button variant="primary" fullWidth icon="📱">
                      Set Weather Alerts
                    </Button>
                    <Button variant="secondary" fullWidth icon="📊">
                      View Detailed Forecast
                    </Button>
                    <Button variant="outline" fullWidth icon="🗺️">
                      Weather Map
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* Incident Report Modal (from Weather Quick Actions) */}
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

export default WeatherPage
