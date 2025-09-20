import React, { useMemo, useState } from 'react'
import { Button } from '../../components/Button'

const presets = [
  {
    id: 'all',
    label: 'All Hazards',
    query: 'India (tsunami OR "storm surge" OR "high waves" OR "swell surge" OR "coastal flooding" OR "rough sea") -is:retweet lang:en',
  },
  {
    id: 'tsunami',
    label: 'Tsunami',
    query: 'India tsunami OR #Tsunami lang:en -is:retweet',
  },
  {
    id: 'waves',
    label: 'High Waves / Rough Sea',
    query: 'India "high waves" OR "rough sea" OR #HighWaves lang:en -is:retweet',
  },
  {
    id: 'storm',
    label: 'Cyclone/Storm Surge',
    query: 'India (cyclone OR #Cyclone OR "storm surge") lang:en -is:retweet',
  },
  {
    id: 'regional',
    label: 'Regional (Multi-lingual)',
    // Avoiding specific languages list to keep the link concise
    query: 'tsunami OR "high waves" OR "storm surge" India',
  },
]

const buildXUrl = (q: string) => `https://x.com/search?q=${encodeURIComponent(q)}&src=typed_query&f=live`
const buildYoutubeUrl = (q: string) => `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`
const buildFacebookUrl = (q: string) => `https://www.facebook.com/search/top?q=${encodeURIComponent(q)}`
const buildRedditUrl = (q: string) => `https://www.reddit.com/search/?q=${encodeURIComponent(q)}`
const buildNewsUrl = (q: string) => `https://news.google.com/search?q=${encodeURIComponent(q)}&hl=en-IN&gl=IN&ceid=IN%3Aen`

export const LiveSocialSearch: React.FC = () => {
  const [presetId, setPresetId] = useState('all')
  const q = useMemo(() => presets.find(p => p.id === presetId)?.query || presets[0].query, [presetId])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {presets.map((p) => (
          <Button
            key={p.id}
            variant={p.id === presetId ? 'primary' : 'outline'}
            onClick={() => setPresetId(p.id)}
          >
            {p.label}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
        <Button variant="outline" onClick={() => window.open(buildXUrl(q), '_blank', 'noopener,noreferrer')}>Open X (Twitter)</Button>
        <Button variant="outline" onClick={() => window.open(buildYoutubeUrl(q), '_blank', 'noopener,noreferrer')}>Open YouTube</Button>
        <Button variant="outline" onClick={() => window.open(buildFacebookUrl(q), '_blank', 'noopener,noreferrer')}>Open Facebook</Button>
        <Button variant="outline" onClick={() => window.open(buildRedditUrl(q), '_blank', 'noopener,noreferrer')}>Open Reddit</Button>
        <Button variant="outline" onClick={() => window.open(buildNewsUrl(q), '_blank', 'noopener,noreferrer')}>Open Google News</Button>
      </div>

      <div className="text-xs text-gray-500">
        The above links open pre-filtered searches for Indian ocean hazards and citizen reports. Use official sources (INCOIS/IMD) to verify critical information.
      </div>
    </div>
  )
}

export default LiveSocialSearch
