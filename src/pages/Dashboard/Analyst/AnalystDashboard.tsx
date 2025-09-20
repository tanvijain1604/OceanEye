import React, { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { ResponsiveContainer, LineChart as RLineChart, Line as RLine, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts'
import { Card, CardContent } from '../../../components/Card'
import { Button } from '../../../components/Button'
import { Badge } from '../../../components/Badge'
import { TrendsChart, PredictiveChart } from '../../../components/Chart'
import { Modal } from '../../../components/Modal'
import { mockTrendsData, mockPredictiveData, getChartColors, defaultChartConfig } from '../../../utils/charts'

export const AnalystDashboard: React.FC = () => {
  const { t } = useTranslation()
  const [showExportModal, setShowExportModal] = useState(false)
  const [selectedFilters, setSelectedFilters] = useState({
    region: 'all',
    severity: 'all',
    timeline: '30days'
  })

  const [appliedFilters, setAppliedFilters] = useState(selectedFilters)

  // --- Constants for filtering logic ---
  const SEVERITY_THRESHOLDS = {
    low: { min: 0, max: 2.8 },
    medium: { min: 2.8, max: 3.4 },
    high: { min: 3.4, max: 3.8 },
    critical: { min: 3.8, max: Infinity },
  }

  const PREDICTIVE_THRESHOLDS = {
    low: { min: 0, max: 18 },
    medium: { min: 18, max: 22 },
    high: { min: 22, max: 26 },
    critical: { min: 26, max: Infinity },
  }

  // Indian coastal states and UTs
  const COASTAL_STATES = [
    'Gujarat',
    'Maharashtra',
    'Goa',
    'Karnataka',
    'Kerala',
    'Tamil Nadu',
    'Andhra Pradesh',
    'Odisha',
    'West Bengal',
    'Puducherry',
    'Andaman & Nicobar',
    'Lakshadweep'
  ] as const

  // Key coastal states to show in comparison
  const keyStates = ['Gujarat', 'Kerala', 'Tamil Nadu', 'Andhra Pradesh', 'Maharashtra'] as const
  const stateOffsets: Record<string, number> = {
    Gujarat: 0,
    Kerala: -3,
    'Tamil Nadu': 2,
    'Andhra Pradesh': 4,
    Maharashtra: -1,
  }
  const colors = getChartColors(defaultChartConfig)

  const monthToRegion = (month: string): string => {
    const map: Record<string, string> = {
      Jan: 'Gujarat',
      Feb: 'Maharashtra',
      Mar: 'Goa',
      Apr: 'Karnataka',
      May: 'Kerala',
      Jun: 'Tamil Nadu',
      Jul: 'Andhra Pradesh',
      Aug: 'Odisha',
      Sep: 'West Bengal',
      Oct: 'Puducherry',
      Nov: 'Andaman & Nicobar',
      Dec: 'Lakshadweep',
    }
    return map[month] ?? 'Gujarat'
  }

  const isInSeverityBucket = (severity: number, bucket: keyof typeof SEVERITY_THRESHOLDS | 'all'): boolean => {
    if (bucket === 'all') return true
    const threshold = SEVERITY_THRESHOLDS[bucket]
    if (threshold) return severity >= threshold.min && severity < threshold.max
    return true
  }

  const applyTimelineToMonths = (data: typeof mockTrendsData, timeline: string) => {
    const counts: Record<string, number> = {
      '7days': 2,
      '30days': 4,
      '90days': 6,
      '1year': 12
    }
    const n = counts[timeline] ?? 4
    return data.slice(-n)
  }

  const filteredTrendsData = useMemo(() => {
    let data = [...mockTrendsData]
    if (appliedFilters.timeline) {
      data = applyTimelineToMonths(data, appliedFilters.timeline)
    }
    if (appliedFilters.severity !== 'all') {
      data = data.filter(d => isInSeverityBucket(d.severity, appliedFilters.severity as keyof typeof SEVERITY_THRESHOLDS))
    }
    if (appliedFilters.region !== 'all') {
      data = data.filter(d => monthToRegion(d.month) === appliedFilters.region)
    }
    return data
  }, [appliedFilters])

  // Build multi-state incident series for comparison (synthetic based on base trend)
  const baseMonths = useMemo(() => {
    let data = [...mockTrendsData]
    if (appliedFilters.timeline) {
      data = applyTimelineToMonths(data, appliedFilters.timeline)
    }
    return data
  }, [appliedFilters.timeline])

  const multiStateData = useMemo(() => {
    return baseMonths.map((d, i) => {
      const row: any = { month: d.month }
      ;(keyStates as readonly string[]).forEach((s) => {
        const variance = ((i % 3) - 1) * 2
        row[s] = Math.max(0, d.incidents + (stateOffsets[s] ?? 0) + variance)
      })
      return row
    })
  }, [baseMonths])

  const dateToRegion = (dateStr: string): string => {
    const day = new Date(dateStr).getDate()
    return COASTAL_STATES[day % COASTAL_STATES.length]
  }

  const isInPredictiveSeverityBucket = (prediction: number, bucket: keyof typeof PREDICTIVE_THRESHOLDS | 'all'): boolean => {
    if (bucket === 'all') return true
    const threshold = PREDICTIVE_THRESHOLDS[bucket]
    if (threshold) return prediction >= threshold.min && prediction < threshold.max
    return true
  }

  const applyTimelineToDays = (data: typeof mockPredictiveData, timeline: string) => {
    const days: Record<string, number> = {
      '7days': 7,
      '30days': 30,
      '90days': 90,
      '1year': 365
    }
    const cutoffDays = days[timeline] ?? 30
    const maxDate = new Date(data[data.length - 1].date).getTime()
    const cutoffMs = maxDate - cutoffDays * 24 * 60 * 60 * 1000
    return data.filter(d => new Date(d.date).getTime() >= cutoffMs)
  }

  const filteredPredictiveData = useMemo(() => {
    let data = [...mockPredictiveData]
    if (appliedFilters.timeline) {
      data = applyTimelineToDays(data, appliedFilters.timeline)
    }
    if (appliedFilters.severity !== 'all') {
      data = data.filter(d => isInPredictiveSeverityBucket(d.predicted, appliedFilters.severity as keyof typeof PREDICTIVE_THRESHOLDS))
    }
    if (appliedFilters.region !== 'all') {
      data = data.filter(d => dateToRegion(d.date) === appliedFilters.region)
    }
    return data
  }, [appliedFilters])

  const handleExport = (format: 'pdf' | 'csv') => {
    // In a real app, this would generate and download the report
    alert(`${format.toUpperCase()} report generated and downloaded!`)
    setShowExportModal(false)
  }

  const handleFilterChange = (filterType: string, value: string) => {
    setSelectedFilters(prev => {
      const next = { ...prev, [filterType]: value }
      setAppliedFilters(next)
      return next
    })
  }

  const analyticsData = {
    totalIncidents: 156,
    resolvedIncidents: 142,
    averageResponseTime: '2.3 hours',
    riskLevel: 'Medium',
    predictedIncidents: 23
  }

  return (
    <div className="relative min-h-screen dashboard-bg py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">
            {t('dashboard.title.analyst')}
          </h1>
          <p className="text-gray-600">
            {t('dashboard.welcome')}, {localStorage.getItem('oceaneye-user-name') || 'Analyst'}.
          </p>
        </motion.div>

        {/* Analytics Overview */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-primary-ocean mb-2">
                {analyticsData.totalIncidents}
              </div>
              <div className="text-gray-600">Total Incidents</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-safe mb-2">
                {analyticsData.resolvedIncidents}
              </div>
              <div className="text-gray-600">Resolved</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-warning mb-2">
                {analyticsData.averageResponseTime}
              </div>
              <div className="text-gray-600">Avg Response Time</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-primary-navy mb-2">
                {analyticsData.predictedIncidents}
              </div>
              <div className="text-gray-600">Predicted This Week</div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Trends Overview */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold text-primary-navy mb-4">
                    {t('analyst.trends.title')}
                  </h2>
                  <TrendsChart data={filteredTrendsData} />
                </CardContent>
              </Card>
            </motion.div>

            {/* State Comparison */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
            >
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-md font-semibold text-primary-navy mb-4">State Comparison (Incidents)</h3>
                  <div style={{ height: 280 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <RLineChart data={multiStateData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                        <XAxis dataKey="month" stroke="#64748b" />
                        <YAxis stroke="#64748b" />
                        <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '1px solid #1E90FF', borderRadius: '8px' }} />
                        <Legend />
                        {keyStates.map((s, idx) => (
                          <RLine key={s} type="monotone" dataKey={s} stroke={colors[idx % colors.length]} strokeWidth={2} dot={{ r: 3 }} />
                        ))}
                      </RLineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Predictive Analytics */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <PredictiveChart data={filteredPredictiveData} />
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Filters */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold text-primary-navy mb-4">
                    {t('analyst.filters.title')}
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Coastal State
                      </label>
                      <select
                        value={selectedFilters.region}
                        onChange={(e) => handleFilterChange('region', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-ocean focus:border-transparent"
                      >
                        <option value="all">All States</option>
                        {COASTAL_STATES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('analyst.filters.severity')}
                      </label>
                      <select
                        value={selectedFilters.severity}
                        onChange={(e) => handleFilterChange('severity', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-ocean focus:border-transparent"
                      >
                        <option value="all">All Severities</option>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('analyst.filters.timeline')}
                      </label>
                      <select
                        value={selectedFilters.timeline}
                        onChange={(e) => handleFilterChange('timeline', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-ocean focus:border-transparent"
                      >
                        <option value="7days">Last 7 Days</option>
                        <option value="30days">Last 30 Days</option>
                        <option value="90days">Last 90 Days</option>
                        <option value="1year">Last Year</option>
                      </select>
                    </div>
                                      </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Risk Assessment */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold text-primary-navy mb-4">
                    Risk Assessment
                  </h2>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Current Risk Level</span>
                      <Badge variant="warning" size="sm">Medium</Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Weather Risk</span>
                        <span className="text-warning">High</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-warning h-2 rounded-full" style={{ width: '75%' }}></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Population Density</span>
                        <span className="text-primary-ocean">Medium</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-primary-ocean h-2 rounded-full" style={{ width: '50%' }}></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Resource Availability</span>
                        <span className="text-safe">Good</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-safe h-2 rounded-full" style={{ width: '80%' }}></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold text-primary-navy mb-4">
                    Quick Actions
                  </h2>
                  <div className="space-y-3">
                    <Button
                      variant="primary"
                      fullWidth
                      onClick={() => setShowExportModal(true)}
                      icon="📊"
                    >
                      {t('analyst.export.title')}
                    </Button>
                    <Button
                      variant="secondary"
                      fullWidth
                      icon="🔍"
                      onClick={() => alert('Deep Analysis coming soon!')}
                    >
                      Deep Analysis
                    </Button>
                    <Button
                      variant="outline"
                      fullWidth
                      icon="📈"
                      onClick={() => alert('Generate Insights coming soon!')}
                    >
                      Generate Insights
                    </Button>
                    <Button
                      variant="safe"
                      fullWidth
                      icon="📋"
                      onClick={() => alert('Create Report coming soon!')}
                    >
                      Create Report
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Recent Insights */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold text-primary-navy mb-4">
                    Recent Insights
                  </h2>
                  <div className="space-y-3">
                    <div className="p-3 bg-warning/10 border-l-4 border-warning rounded">
                      <div className="text-sm font-medium text-warning">Weather Alert</div>
                      <div className="text-xs text-gray-600">High rainfall predicted for next 48 hours</div>
                    </div>
                    <div className="p-3 bg-primary-ocean/10 border-l-4 border-primary-ocean rounded">
                      <div className="text-sm font-medium text-primary-ocean">Trend Analysis</div>
                      <div className="text-xs text-gray-600">Incident frequency increased by 15% this month</div>
                    </div>
                    <div className="p-3 bg-safe/10 border-l-4 border-safe rounded">
                      <div className="text-sm font-medium text-safe">Resource Status</div>
                      <div className="text-xs text-gray-600">Emergency supplies at optimal levels</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* Export Modal */}
        <Modal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          title={t('analyst.export.title')}
          size="md"
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              Choose the format for your analytics report:
            </p>
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                onClick={() => handleExport('pdf')}
                icon="📄"
                className="h-20 flex-col"
              >
                <span className="text-2xl mb-2">📄</span>
                {t('analyst.export.pdf')}
              </Button>
              <Button
                variant="outline"
                onClick={() => handleExport('csv')}
                icon="📊"
                className="h-20 flex-col"
              >
                <span className="text-2xl mb-2">📊</span>
                {t('analyst.export.csv')}
              </Button>
            </div>
            <div className="text-sm text-gray-500 text-center">
              Reports will be generated based on your current filters and sent to your email.
            </div>
          </div>
        </Modal>
      </div>
    </div>
  )
}

export default AnalystDashboard
