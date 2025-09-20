import React, { useMemo, useState } from 'react'
import { Button } from '../../components/Button'

const templates = [
  {
    id: 'all',
    label: 'All Hazards (India)',
    q: 'India (tsunami OR "storm surge" OR "high waves" OR cyclone OR "coastal flooding")',
  },
  { id: 'tsunami', label: 'Tsunami (India)', q: 'India tsunami' },
  { id: 'waves', label: 'High Waves (India)', q: 'India "high waves" OR "rough sea"' },
  { id: 'cyclone', label: 'Cyclone/Storm Surge', q: 'India cyclone OR "storm surge"' },
]

type Tag = 'tsunami' | 'waves' | 'cyclone'

type Headline = {
  id: string
  title: string
  source: string
  url: string
  time: string
  tags: Tag[]
}

const newsUrl = (q: string) => `https://news.google.com/search?q=${encodeURIComponent(q)}&hl=en-IN&gl=IN&ceid=IN%3Aen`

// Mock headlines for display on the Social page
const mockHeadlines: Headline[] = [
  {
    id: 'h1',
    title: 'IMD issues orange alert for coastal Tamil Nadu amid rough sea conditions',
    source: 'IMD Bulletin',
    url: 'https://mausam.imd.gov.in',
    time: '2h ago',
    tags: ['waves', 'cyclone'],
  },
  {
    id: 'h2',
    title: 'INCOIS warns of high waves along Kerala coast for next 48 hours',
    source: 'INCOIS Advisory',
    url: 'https://incois.gov.in',
    time: '3h ago',
    tags: ['waves'],
  },
  {
    id: 'h3',
    title: 'Cyclone over Bay of Bengal strengthens; fishermen urged not to venture into sea',
    source: 'The Hindu',
    url: 'https://news.google.com',
    time: '5h ago',
    tags: ['cyclone'],
  },
  {
    id: 'h4',
    title: 'Tsunami preparedness drill conducted across Andaman and Nicobar Islands',
    source: 'PIB India',
    url: 'https://news.google.com',
    time: 'Today',
    tags: ['tsunami'],
  },
  {
    id: 'h5',
    title: 'Mumbai high tide: civic body issues coastal safety advisory for weekend',
    source: 'Times of India',
    url: 'https://news.google.com',
    time: '1d ago',
    tags: ['waves'],
  },
  {
    id: 'h6',
    title: 'Odisha coast under watch as deep depression intensifies',
    source: 'IMD RSMC New Delhi',
    url: 'https://rsmcnewdelhi.imd.gov.in',
    time: '1d ago',
    tags: ['cyclone'],
  },
  {
    id: 'h7',
    title: 'Goa lifeguards rescue 12 as rip currents strengthen over weekend',
    source: 'Local Administration',
    url: 'https://news.google.com',
    time: '2d ago',
    tags: ['waves'],
  },
  {
    id: 'h8',
    title: 'Storm surge risk flagged for parts of West Bengal coast',
    source: 'NDMA',
    url: 'https://ndma.gov.in',
    time: '2d ago',
    tags: ['cyclone'],
  },
]

export const HeadlinesPanel: React.FC = () => {
  const [id, setId] = useState('all')
  const q = useMemo(() => templates.find(t => t.id === id)?.q || templates[0].q, [id])

  const filtered = useMemo(() => {
    if (id === 'all') return mockHeadlines
    return mockHeadlines.filter(h => h.tags.includes(id as Tag))
  }, [id])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {templates.map((t) => (
          <Button key={t.id} variant={t.id === id ? 'primary' : 'outline'} onClick={() => setId(t.id)}>
            {t.label}
          </Button>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <Button variant="outline" onClick={() => window.open(newsUrl(q), '_blank', 'noopener,noreferrer')}>Open Google News</Button>
        <Button variant="outline" onClick={() => window.open('https://mausam.imd.gov.in', '_blank', 'noopener,noreferrer')}>Open IMD Mausam</Button>
        <Button variant="outline" onClick={() => window.open('https://incois.gov.in', '_blank', 'noopener,noreferrer')}>Open INCOIS</Button>
      </div>

      <div className="text-xs text-gray-500">These open authoritative news and portals with relevant filters for Indian ocean hazards.</div>

      <div className="mt-2">
        <div className="mb-2 text-sm font-semibold text-primary-navy">Mock Headlines</div>
        <ul className="divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white">
          {filtered.map((h) => (
            <li key={h.id} className="p-4 hover:bg-gray-50">
              <a href={h.url} target="_blank" rel="noopener noreferrer" className="block">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="font-medium text-gray-900">{h.title}</div>
                    <div className="mt-1 text-xs text-gray-500">
                      <span>{h.source}</span>
                      <span className="mx-2">•</span>
                      <span>{h.time}</span>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-1">
                    {h.tags.map(tag => (
                      <span key={tag} className="rounded bg-primary-foam px-2 py-0.5 text-[10px] font-medium text-primary-navy uppercase">{tag}</span>
                    ))}
                  </div>
                </div>
              </a>
            </li>
          ))}
          {filtered.length === 0 && (
            <li className="p-4 text-sm text-gray-500">No headlines for this filter.</li>
          )}
        </ul>
      </div>
    </div>
  )
}

export default HeadlinesPanel
