import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Card } from './Card'
import { Button } from './Button'
import { Badge } from './Badge'
import { useLocation } from '../providers/LocationProvider'
import { haversineDistanceKm } from '../utils/location'

// A lightweight, client-side aggregator for disaster-related alerts.
// Note: Some sources (e.g., certain government XML feeds) may block cross-origin requests from browsers.
// In such cases, items from those sources will fail to load unless accessed via a proxy/serverless function.

export type FeedItem = {
  id: string
  title: string
  link: string
  published: string
  summary?: string
  source: string
  sourceLink: string
  lat?: number
  lng?: number
}

type FeedConfig = {
  key: string
  type: 'atom' | 'nws'
  url: string
  source: string
  sourceLink: string
}

const FEEDS: FeedConfig[] = [
  {
    key: 'tsunamiGov',
    type: 'atom',
    url: 'https://www.tsunami.gov/events.xml', // NOAA/NWS NTWC Atom feed
    source: 'NOAA/NWS National Tsunami Warning Center',
    sourceLink: 'https://www.tsunami.gov/'
  },
  {
    key: 'nwsTsunamiWarning',
    type: 'nws',
    url: 'https://api.weather.gov/alerts/active?event=Tsunami%20Warning',
    source: 'NWS Alerts API',
    sourceLink: 'https://api.weather.gov/'
  },
  {
    key: 'nwsTsunamiAdvisory',
    type: 'nws',
    url: 'https://api.weather.gov/alerts/active?event=Tsunami%20Advisory',
    source: 'NWS Alerts API',
    sourceLink: 'https://api.weather.gov/'
  },
  {
    key: 'nwsCoastalFloodWarning',
    type: 'nws',
    url: 'https://api.weather.gov/alerts/active?event=Coastal%20Flood%20Warning',
    source: 'NWS Alerts API',
    sourceLink: 'https://api.weather.gov/'
  },
  {
    key: 'nwsHighSurfAdvisory',
    type: 'nws',
    url: 'https://api.weather.gov/alerts/active?event=High%20Surf%20Advisory',
    source: 'NWS Alerts API',
    sourceLink: 'https://api.weather.gov/'
  }
]

const parseAtom = (xmlText: string, source: string, sourceLink: string): FeedItem[] => {
  try {
    const doc = new DOMParser().parseFromString(xmlText, 'application/xml')
    const entries = Array.from(doc.getElementsByTagName('entry'))
    return entries.map((entry) => {
      const id = entry.getElementsByTagName('id')[0]?.textContent || ''
      const title = entry.getElementsByTagName('title')[0]?.textContent || 'Update'
      const linkEl = entry.getElementsByTagName('link')[0]
      const link = linkEl?.getAttribute('href') || '#'
      const published = entry.getElementsByTagName('updated')[0]?.textContent 
        || entry.getElementsByTagName('published')[0]?.textContent 
        || new Date().toISOString()
      const summary = entry.getElementsByTagName('summary')[0]?.textContent 
        || entry.getElementsByTagName('content')[0]?.textContent 
        || undefined
      return {
        id: `atom|${id}`,
        title,
        link,
        published,
        summary,
        source,
        sourceLink
      }
    })
  } catch (e) {
    console.error('Failed to parse Atom feed', e)
    return []
  }
}

const computeGeoCenter = (geometry: any): { lat: number; lng: number } | null => {
  if (!geometry) return null
  try {
    if (geometry.type === 'Point' && Array.isArray(geometry.coordinates)) {
      const [lng, lat] = geometry.coordinates
      return { lat, lng }
    }
    const coords = geometry.coordinates
    // For Polygon: [ [ [lng,lat], ... ] ] ; For MultiPolygon: [ [ [ [lng,lat], ... ] ] ]
    const flat: [number, number][] = []
    const flatten = (arr: any) => {
      if (!arr) return
      if (typeof arr[0] === 'number') {
        flat.push([arr[0], arr[1]])
      } else {
        for (const a of arr) flatten(a)
      }
    }
    flatten(coords)
    if (flat.length === 0) return null
    const sum = flat.reduce((acc, [x, y]) => ({ x: acc.x + x, y: acc.y + y }), { x: 0, y: 0 })
    const lng = sum.x / flat.length
    const lat = sum.y / flat.length
    return { lat, lng }
  } catch {
    return null
  }
}

const parseNwsAlerts = (json: any, source: string, sourceLink: string): FeedItem[] => {
  try {
    const features = json?.features || []
    return features.map((f: any) => {
      const p = f?.properties || {}
      const id = f?.id || p?.id || Math.random().toString(36).slice(2)
      const title = p?.event ? `${p.event}${p.headline ? ` — ${p.headline}` : ''}` : 'Alert'
      const link = p?.uri || p?.url || f?.id || '#'
      const published = p?.sent || p?.effective || p?.onset || new Date().toISOString()
      const summary = p?.description || p?.instruction || p?.headline
      const center = computeGeoCenter(f?.geometry)
      return {
        id: `nws|${id}`,
        title,
        link,
        published,
        summary,
        source,
        sourceLink,
        lat: center?.lat,
        lng: center?.lng
      }
    })
  } catch (e) {
    console.error('Failed to parse NWS alerts', e)
    return []
  }
}

function formatRelative(iso: string) {
  const date = new Date(iso)
  const diffMs = date.getTime() - Date.now()
  const abs = Math.abs(diffMs)
  const minutes = Math.round(abs / 60000)
  const hours = Math.round(abs / 3600000)
  const days = Math.round(abs / 86400000)
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' })
  if (abs < 60000) return 'just now'
  if (abs < 3600000) return rtf.format(Math.sign(diffMs) * minutes, 'minute')
  if (abs < 86400000) return rtf.format(Math.sign(diffMs) * hours, 'hour')
  return rtf.format(Math.sign(diffMs) * days, 'day')
}

// Prefer human-readable pages over raw XML/JSON when opening items
function getReadableLink(item: FeedItem): string {
  const href = item.link || '#'
  if (/api\.weather\.gov/.test(href) || /\.cap(\b|$)/.test(href)) {
    return 'https://www.weather.gov/alerts'
  }
  if (/tsunami\.gov\/.+\.xml$/i.test(href)) {
    return 'https://www.tsunami.gov/'
  }
  return href
}

export const LiveDisasterFeed: React.FC<{ refreshIntervalMs?: number; limit?: number }> = ({
  refreshIntervalMs = 120000, // 2 minutes
  limit = 12
}) => {
  const [items, setItems] = useState<FeedItem[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [errors, setErrors] = useState<Record<string, string | null>>({})
  const { coords, locateOnce } = useLocation()
  const [radiusKm, setRadiusKm] = useState<number>(250)
  const [nearOnly, setNearOnly] = useState<boolean>(false)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    const newErrors: Record<string, string | null> = {}

    const results = await Promise.all(
      FEEDS.map(async (feed) => {
        try {
          const res = await fetch(feed.url, {
            headers: feed.type === 'nws' ? { Accept: 'application/geo+json' } : undefined,
            // Note: User-Agent cannot be set in browser; api.weather.gov generally supports CORS for browsers.
          })
          if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
          const data = feed.type === 'atom' ? await res.text() : await res.json()
          const parsed = feed.type === 'atom'
            ? parseAtom(data as string, feed.source, feed.sourceLink)
            : parseNwsAlerts(data, feed.source, feed.sourceLink)
          newErrors[feed.key] = null
          return parsed
        } catch (e: any) {
          console.warn(`Failed to fetch ${feed.key}:`, e?.message || e)
          newErrors[feed.key] = e?.message || 'Fetch error'
          return [] as FeedItem[]
        }
      })
    )

    // Flatten, sort by published desc, and limit
    const flat = results.flat().filter(Boolean)
    flat.sort((a, b) => new Date(b.published).getTime() - new Date(a.published).getTime())
    setItems(flat.slice(0, limit))
    setErrors(newErrors)
    setLoading(false)
  }, [limit])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  useEffect(() => {
    const id = window.setInterval(fetchAll, refreshIntervalMs)
    return () => window.clearInterval(id)
  }, [fetchAll, refreshIntervalMs])

  const anyError = useMemo(() => Object.values(errors).some(Boolean), [errors])

  const filteredItems = useMemo(() => {
    if (nearOnly && coords) {
      return items.filter((it) => {
        if (typeof it.lat === 'number' && typeof it.lng === 'number') {
          return haversineDistanceKm(coords, { lat: it.lat, lng: it.lng }) <= radiusKm
        }
        // If no location on item, exclude when nearOnly is true
        return false
      })
    }
    return items
  }, [items, nearOnly, coords, radiusKm])

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-2xl font-semibold text-primary-navy">Live Official Alerts</h3>
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1 text-sm">
            <span>Radius:</span>
            <select
              value={radiusKm}
              onChange={(e) => setRadiusKm(parseInt(e.target.value, 10))}
              className="px-2 py-1 border rounded"
            >
              <option value={50}>50km</option>
              <option value={100}>100km</option>
              <option value={250}>250km</option>
              <option value={500}>500km</option>
            </select>
          </div>
          <label className="flex items-center gap-1 text-sm">
            <input type="checkbox" checked={nearOnly} onChange={(e) => setNearOnly(e.target.checked)} />
            Near me
          </label>
          <Button size="sm" variant="outline" onClick={locateOnce}>Use My Location</Button>
          {loading ? (
            <span className="text-sm text-gray-500">Refreshing…</span>
          ) : (
            <Button size="sm" variant="primary" onClick={fetchAll}>
              Refresh
            </Button>
          )}
        </div>
      </div>

      {anyError && (
        <div className="mb-4 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-3">
          Some sources could not be loaded (possibly due to network or CORS restrictions). The feed will include all successfully fetched sources.
        </div>
      )}

      {filteredItems.length === 0 && !loading && (
        <div className="text-gray-600">No recent alerts available{nearOnly ? ' for your selected area.' : '.'}</div>
      )}

      <ul className="space-y-4">
        {filteredItems.map((item) => (
          <li key={item.id} className="border rounded-lg p-4 bg-white">
            <div className="flex items-start justify-between gap-4">
              <a href={getReadableLink(item)} target="_blank" rel="noopener noreferrer" className="text-primary-navy hover:underline font-medium">
                {item.title}
              </a>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Badge variant="info">{new URL(item.sourceLink).hostname}</Badge>
              </div>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {new Date(item.published).toLocaleString()} • {formatRelative(item.published)}
            </div>
            {item.summary && (
              <p className="text-sm text-gray-700 mt-2 line-clamp-4">{item.summary}</p>
            )}
            <div className="text-xs text-gray-500 mt-2">
              Source: <a className="underline" href={item.sourceLink} target="_blank" rel="noopener noreferrer">{item.source}</a>
              { (getReadableLink(item) !== item.link) && (
                <span> • <a className="underline" href={item.link} target="_blank" rel="noopener noreferrer">Raw data</a></span>
              ) }
            </div>
          </li>
        ))}
      </ul>

      <div className="text-xs text-gray-500 mt-4">
        Sources: NOAA/NWS National Tsunami Warning Center Atom feed (tsunami.gov) and National Weather Service Alerts API (api.weather.gov). Data updates automatically every 2 minutes.
      </div>
    </Card>
  )
}

export default LiveDisasterFeed
