import React, { useState } from 'react'
import { Card, CardContent } from '../../components/Card'
import { Button } from '../../components/Button'
import { useNavigate } from 'react-router-dom'
import { useReports } from '../../providers/ReportsProvider'
import LiveSocialSearch from './LiveSocialSearch'
import LiveReportsFeed from './LiveReportsFeed'
import CommentsBoard from './CommentsBoard'
import HeadlinesPanel from './HeadlinesPanel'

const sources = [
  {
    name: 'INCOIS – Tsunami Early Warning Centre',
    description: 'Official tsunami bulletins and status from the Indian National Centre for Ocean Information Services (INCOIS).',
    url: 'https://tsunami.incois.gov.in',
    icon: '🌊'
  },
  {
    name: 'INCOIS – Main Portal',
    description: 'Ocean information, advisories and services for maritime safety and coastal stakeholders.',
    url: 'https://incois.gov.in',
    icon: '🏛️'
  },
  {
    name: 'IMD – RSMC Cyclone (New Delhi)',
    description: 'Tropical cyclone advisories and bulletins for the North Indian Ocean by IMD RSMC New Delhi.',
    url: 'https://rsmcnewdelhi.imd.gov.in',
    icon: '🌀'
  },
  {
    name: 'IMD – Mausam (National Weather Portal)',
    description: 'National weather warnings, nowcasts, radar/satellite and rainfall information by IMD.',
    url: 'https://mausam.imd.gov.in',
    icon: '⛅'
  },
  {
    name: 'NDMA – National Disaster Management Authority',
    description: 'National disaster management information and alerts for India.',
    url: 'https://ndma.gov.in',
    icon: '🛡️'
  },
  {
    name: 'Indian Coast Guard',
    description: 'Maritime safety, advisories and updates from Indian Coast Guard.',
    url: 'https://indiancoastguard.gov.in',
    icon: '⚓'
  }
]

export const SocialMediaPage: React.FC = () => {
  const navigate = useNavigate()
  const { reports } = useReports()
  const recent = reports.slice(0, 8)

  return (
    <div className="min-h-screen bg-primary-foam py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
            Live Ocean Hazard Reports (India)
          </h1>
          <p className="text-lg text-gray-200 max-w-4xl mx-auto">
            Quick access to official Indian sources (INCOIS, IMD, NDMA, Indian Coast Guard) and latest citizen-submitted observations from this platform.
          </p>
        </div>

        {/* Official Indian Sources */}
        <Card className="mb-10">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold text-primary-navy mb-4">Official Indian Sources</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sources.map((s) => (
                <div key={s.url} className="border border-gray-200 rounded-lg p-5 bg-white flex flex-col">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="text-2xl" aria-hidden>{s.icon}</div>
                    <div>
                      <div className="font-semibold text-primary-navy">{s.name}</div>
                      <div className="text-sm text-gray-600">{s.description}</div>
                    </div>
                  </div>
                  <div className="mt-auto">
                    <Button variant="outline" onClick={() => window.open(s.url, '_blank', 'noopener,noreferrer')}>Open</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Live Social Signals (External) */}
        <Card className="mb-10">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold text-primary-navy mb-4">Live Social Signals (External)</h2>
            <p className="text-sm text-gray-600 mb-4">Open pre-filtered searches for latest citizen posts about ocean hazards in India. These links open in new tabs.</p>
            <LiveSocialSearch />
          </CardContent>
        </Card>

        {/* Live Citizen Reports (Auto-refresh) */}
        <Card className="mb-10" id="live-reports">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-primary-navy">Live Citizen Reports</h2>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => document.getElementById('comments')?.scrollIntoView({ behavior: 'smooth' })}>Go to Comments</Button>
                <Button variant="outline" onClick={() => document.getElementById('headlines')?.scrollIntoView({ behavior: 'smooth' })}>Go to Headlines</Button>
                <Button variant="primary" onClick={() => navigate('/dashboard/citizen')}>Open Map & Reporting</Button>
              </div>
            </div>
            <LiveReportsFeed />
          </CardContent>
        </Card>

        {/* Community Comments */}
        <Card className="mb-10" id="comments">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold text-primary-navy mb-4">Community Comments</h2>
            <CommentsBoard />
          </CardContent>
        </Card>

        {/* Trending Headlines */}
        <Card id="headlines">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold text-primary-navy mb-4">Trending Headlines (India)</h2>
            <HeadlinesPanel />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default SocialMediaPage
