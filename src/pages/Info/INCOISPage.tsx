import React from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '../../components/Card'

export const INCOISPage: React.FC = () => {
  useTranslation()

  return (
    <div className="min-h-screen bg-primary-foam py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* About INCOIS */}
        <h1 className="text-4xl font-bold text-white mb-6 text-center">
          About INCOIS
        </h1>
        <Card className="mb-10">
          <CardContent className="p-6">
            <p className="text-gray-700 mb-4">
              The Indian National Centre for Ocean Information Services (INCOIS) is an autonomous organization under the
              Ministry of Earth Sciences (MoES), Government of India. It provides timely ocean information and advisory
              services to fishermen, coastal communities, maritime sectors, disaster management authorities, and the research community.
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-1 mb-4">
              <li>Indian Tsunami Early Warning Centre (ITEWC) for the Indian Ocean region</li>
              <li>Ocean State Forecasts for safe navigation and coastal operations</li>
              <li>Potential Fishing Zone (PFZ) advisories using satellite and ocean model data</li>
              <li>High wave, swell surge, storm surge and coastal inundation advisories</li>
              <li>Search and Rescue (SAR) support via drift and trajectory models</li>
            </ul>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-sm text-gray-600">Headquarters: Hyderabad, India</div>
              <a
                href="https://incois.gov.in/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center px-4 py-2 rounded-lg bg-primary-ocean text-white hover:bg-primary-steel transition-colors"
                title="Visit official INCOIS website"
              >
                Visit Official Website
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default INCOISPage
