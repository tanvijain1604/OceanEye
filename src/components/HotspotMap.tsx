import React, { useEffect, useMemo, useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import { useReports } from '../providers/ReportsProvider'
import { useLocation } from '../providers/LocationProvider'
import { haversineDistanceKm } from '../utils/location'
import { DEFAULT_CENTER } from '../utils/map'

// Ensure default Leaflet marker icons load correctly
// (react-leaflet with Vite sometimes needs this manual config)
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Types
export type HotspotMode = 'density' | 'keywords' | 'verified'

interface SocialItem {
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

interface Point {
  lat: number
  lng: number
  type: 'report' | 'social'
  weight: number
  approved?: boolean
  keywordsCount?: number
  meta?: any
}

// Utility: parse NWS Alerts (GeoJSON) to SocialItem[]
const computeGeoCenter = (geometry: any): { lat: number; lng: number } | null => {
  if (!geometry) return null
  try {
    if (geometry.type === 'Point' && Array.isArray(geometry.coordinates)) {
      const [lng, lat] = geometry.coordinates
      return { lat, lng }
    }
    const coords = geometry.coordinates
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

const parseNwsAlerts = (json: any, source: string, sourceLink: string): SocialItem[] => {
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
        lng: center?.lng,
      }
    })
  } catch {
    return []
  }
}

// Quick util: parse "lat, lng" coordinates from a free-text location field
const parseLatLngFromString = (s?: string): { lat: number; lng: number } | null => {
  if (!s) return null
  const m = s.match(/(-?\d{1,2}\.\d+)[,\s]+(-?\d{1,3}\.\d+)/)
  if (m) {
    const lat = parseFloat(m[1])
    const lng = parseFloat(m[2])
    if (!Number.isNaN(lat) && !Number.isNaN(lng)) return { lat, lng }
  }
  return null
}

// Color interpolation from blue (#3b82f6) -> orange (#f59e0b) -> red (#ef4444)
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const hexToRgb = (hex: string) => ({
  r: parseInt(hex.slice(1, 3), 16),
  g: parseInt(hex.slice(3, 5), 16),
  b: parseInt(hex.slice(5, 7), 16),
})
const rgbToHex = (r: number, g: number, b: number) => `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`
const colorScale = (t: number) => {
  const c1 = hexToRgb('#3b82f6') // blue
  const c2 = hexToRgb('#f59e0b') // orange
  const c3 = hexToRgb('#ef4444') // red
  if (t < 0.5) {
    const k = t / 0.5
    return rgbToHex(Math.round(lerp(c1.r, c2.r, k)), Math.round(lerp(c1.g, c2.g, k)), Math.round(lerp(c1.b, c2.b, k)))
  }
  const k = (t - 0.5) / 0.5
  return rgbToHex(Math.round(lerp(c2.r, c3.r, k)), Math.round(lerp(c2.g, c3.g, k)), Math.round(lerp(c2.b, c3.b, k)))
}

// Map event collector to track zoom/center for responsive hotspot sizing
const MapEvents: React.FC<{ onUpdate: (center: [number, number], zoom: number) => void }> = ({ onUpdate }) => {
  useMapEvents({
    moveend: (e) => {
      const m = e.target
      onUpdate([m.getCenter().lat, m.getCenter().lng], m.getZoom())
    },
    zoomend: (e) => {
      const m = e.target
      onUpdate([m.getCenter().lat, m.getCenter().lng], m.getZoom())
    },
  })
  return null
}

export const HotspotMap: React.FC<{
  height?: string
  defaultCenter?: [number, number]
  defaultZoom?: number
}> = ({ height = '500px', defaultCenter = DEFAULT_CENTER, defaultZoom = 11 }) => {
  const { reports } = useReports()
  const { coords, locateOnce } = useLocation()

  const [includeReports, setIncludeReports] = useState(true)
  const [includeSocial, setIncludeSocial] = useState(true)
  const [mode, setMode] = useState<HotspotMode>('density')
  const [keywordsText, setKeywordsText] = useState<string>('#tsunami,#flood,#stormsurge,#highwaves,#swell')
  const [showMarkers, setShowMarkers] = useState<boolean>(true)

  const [socialItems, setSocialItems] = useState<SocialItem[]>([])
  const [loadingSocial, setLoadingSocial] = useState(false)

  const mapRef = useRef<L.Map | null>(null)
  const [mapCenter, setMapCenter] = useState<[number, number]>(coords ? [coords.lat, coords.lng] : defaultCenter)
  const [mapZoom, setMapZoom] = useState<number>(defaultZoom)

  const keywords = useMemo(() => keywordsText
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => s.replace(/^#/, ''))
    , [keywordsText])

  // Fetch social alerts periodically (NWS alerts with geospatial data)
  useEffect(() => {
    let active = true
    const fetchAll = async () => {
      try {
        setLoadingSocial(true)
        const feeds = [
          { key: 'nwsTsunamiWarning', url: 'https://api.weather.gov/alerts/active?event=Tsunami%20Warning', source: 'NWS Alerts API', sourceLink: 'https://api.weather.gov/' },
          { key: 'nwsTsunamiAdvisory', url: 'https://api.weather.gov/alerts/active?event=Tsunami%20Advisory', source: 'NWS Alerts API', sourceLink: 'https://api.weather.gov/' },
          { key: 'nwsCoastalFloodWarning', url: 'https://api.weather.gov/alerts/active?event=Coastal%20Flood%20Warning', source: 'NWS Alerts API', sourceLink: 'https://api.weather.gov/' },
          { key: 'nwsHighSurfAdvisory', url: 'https://api.weather.gov/alerts/active?event=High%20Surf%20Advisory', source: 'NWS Alerts API', sourceLink: 'https://api.weather.gov/' },
        ]
        const results = await Promise.allSettled(
          feeds.map(async (f) => {
            const res = await fetch(f.url, { headers: { Accept: 'application/geo+json' } })
            if (!res.ok) throw new Error(`${res.status}`)
            const json = await res.json()
            return parseNwsAlerts(json, f.source, f.sourceLink)
          })
        )
        if (!active) return
        const items: SocialItem[] = []
        for (const r of results) {
          if (r.status === 'fulfilled') items.push(...r.value)
        }
        // Deduplicate by id
        const map = new Map<string, SocialItem>()
        for (const it of items) map.set(it.id, it)
        // Sort newest first
        const uniq = Array.from(map.values()).sort((a, b) => new Date(b.published).getTime() - new Date(a.published).getTime())
        setSocialItems(uniq)
      } catch {
        if (active) setSocialItems([])
      } finally {
        if (active) setLoadingSocial(false)
      }
    }

    fetchAll()
    const id = window.setInterval(fetchAll, 300000) // 5 minutes
    return () => {
      active = false
      window.clearInterval(id)
    }
  }, [])

  // Derive point set from reports and social items
  const points: Point[] = useMemo(() => {
    const pts: Point[] = []

    if (includeReports) {
      for (const r of reports) {
        let lat = r.lat
        let lng = r.lng
        if (lat == null || lng == null) {
          const parsed = parseLatLngFromString(r.location)
          if (parsed) { lat = parsed.lat; lng = parsed.lng }
        }
        if (lat == null || lng == null) continue
        const text = `${r.type} ${r.description} ${r.location}`.toLowerCase()
        const kcount = keywords.reduce((acc, k) => acc + (text.includes(k.toLowerCase()) ? 1 : 0), 0)
        let weight = 1
        if (mode === 'verified') {
          weight = r.status === 'approved' ? 2 : 0.5
        } else if (mode === 'keywords') {
          weight = 1 + kcount
        }
        pts.push({ lat, lng, type: 'report', weight, approved: r.status === 'approved', keywordsCount: kcount, meta: r })
      }
    }

    if (includeSocial) {
      for (const s of socialItems) {
        if (s.lat == null || s.lng == null) continue
        const text = `${s.title} ${s.summary || ''}`.toLowerCase()
        const kcount = keywords.reduce((acc, k) => acc + (text.includes(k.toLowerCase()) ? 1 : 0), 0)
        let weight = 0.7
        if (mode === 'verified') {
          // Treat social alerts as already verified signals
          weight = 2
        } else if (mode === 'keywords') {
          weight = 0.7 + kcount * 0.7
        }
        pts.push({ lat: s.lat, lng: s.lng, type: 'social', weight, approved: true, keywordsCount: kcount, meta: s })
      }
    }

    return pts
  }, [reports, socialItems, includeReports, includeSocial, mode, keywords])

  // Determine dynamic grid cell size based on zoom level
  const cellSizeDeg = useMemo(() => {
    // Approx mapping: higher zoom -> smaller cell
    if (mapZoom >= 15) return 0.002 // ~200 m
    if (mapZoom >= 13) return 0.005 // ~500 m
    if (mapZoom >= 11) return 0.01 // ~1.1 km
    if (mapZoom >= 9) return 0.02 // ~2.2 km
    return 0.05 // coarse
  }, [mapZoom])

  // Bin points into grid cells
  const bins = useMemo(() => {
    const m = new Map<string, {
      latCenter: number
      lngCenter: number
      sum: number
      count: number
      reports: number
      social: number
      approved: number
    }>()

    for (const p of points) {
      const latIdx = Math.floor(p.lat / cellSizeDeg)
      const lngIdx = Math.floor(p.lng / cellSizeDeg)
      const latCenter = (latIdx + 0.5) * cellSizeDeg
      const lngCenter = (lngIdx + 0.5) * cellSizeDeg
      const key = `${latIdx}|${lngIdx}`
      const cur = m.get(key) || { latCenter, lngCenter, sum: 0, count: 0, reports: 0, social: 0, approved: 0 }
      cur.sum += p.weight
      cur.count += 1
      if (p.type === 'report') cur.reports += 1
      if (p.type === 'social') cur.social += 1
      if (p.approved) cur.approved += 1
      m.set(key, cur)
    }

    return Array.from(m.values())
  }, [points, cellSizeDeg])

  const maxBinSum = useMemo(() => bins.reduce((mx, b) => Math.max(mx, b.sum), 0) || 1, [bins])

  // Compute circle radius in meters depending on zoom and bin intensity
  const getRadiusMeters = (norm: number) => {
    // Base scales with zoom so that circles look reasonable
    const base = 800 * Math.pow(2, 12 - mapZoom) // decrease with zoom-in
    return Math.max(80, base * Math.sqrt(norm))
  }

  // Optional: my location marker
  const myLoc = coords ? { lat: coords.lat, lng: coords.lng } : null

  // Derived markers to plot (downsample if too many)
  const markers = useMemo(() => {
    const maxMarkers = 200
    if (points.length <= maxMarkers) return points
    // Keep closest N to center for performance
    const center = { lat: mapCenter[0], lng: mapCenter[1] }
    return [...points]
      .map((p) => ({ ...p, d: haversineDistanceKm(center, { lat: p.lat, lng: p.lng }) }))
      .sort((a, b) => a.d - b.d)
      .slice(0, maxMarkers)
  }, [points, mapCenter])

  // Keep map centered on user location if available on mount
  const didCenterRef = useRef(false)
  useEffect(() => {
    if (!didCenterRef.current && coords) {
      setMapCenter([coords.lat, coords.lng])
      setMapZoom((z) => (z < 12 ? 12 : z))
      didCenterRef.current = true
    }
  }, [coords])

  return (
    <div className="map-container rounded-lg border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2">
            <label className="text-sm flex items-center gap-1">
              <input type="checkbox" checked={includeReports} onChange={(e) => setIncludeReports(e.target.checked)} />
              Reports
            </label>
            <label className="text-sm flex items-center gap-1">
              <input type="checkbox" checked={includeSocial} onChange={(e) => setIncludeSocial(e.target.checked)} />
              Social indicators
            </label>
            <label className="text-sm flex items-center gap-1">
              <input type="checkbox" checked={showMarkers} onChange={(e) => setShowMarkers(e.target.checked)} />
              Show points
            </label>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span>Hotspots by:</span>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as HotspotMode)}
              className="px-2 py-1 border rounded"
            >
              <option value="density">Report density</option>
              <option value="keywords">Keyword frequency</option>
              <option value="verified">Verified/incidents</option>
            </select>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span>Keywords:</span>
            <input
              value={keywordsText}
              onChange={(e) => setKeywordsText(e.target.value)}
              className="px-2 py-1 border rounded w-64"
              placeholder="#tsunami,#flood"
            />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={locateOnce}
              className="px-3 py-1 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700"
            >
              Use My Location
            </button>
            {loadingSocial && <span className="text-xs text-gray-500">Updating feeds…</span>}
          </div>
        </div>
      </div>

      <div style={{ height }} className="relative">
        <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
        >
          <MapEvents onUpdate={(c, z) => { setMapCenter(c); setMapZoom(z) }} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {myLoc && (
            <Marker position={[myLoc.lat, myLoc.lng]}>
              <Popup>You are here</Popup>
            </Marker>
          )}

          {/* Hotspot circles */}
          {bins.map((b, idx) => {
            const norm = Math.min(1, b.sum / maxBinSum)
            const radius = getRadiusMeters(norm)
            const color = colorScale(norm)
            return (
              <Circle
                key={`bin-${idx}`}
                center={[b.latCenter, b.lngCenter]}
                radius={radius}
                pathOptions={{ color, fillColor: color, fillOpacity: 0.3 }}
              >
                <Popup>
                  <div className="text-sm">
                    <div className="font-semibold text-primary-navy mb-1">Hotspot</div>
                    <div>Total weight: {b.sum.toFixed(1)}</div>
                    <div>Signals: {b.count} (reports: {b.reports}, social: {b.social})</div>
                    <div>Verified: {b.approved}</div>
                  </div>
                </Popup>
              </Circle>
            )
          })}

          {/* Individual points (optional) */}
          {showMarkers && markers.map((p, i) => (
            <Marker key={`pt-${i}`} position={[p.lat, p.lng]}>
              <Popup>
                {p.type === 'report' ? (
                  <div className="text-sm">
                    <div className="font-semibold text-primary-navy mb-1">Crowdsourced Report</div>
                    <div>Weight: {p.weight.toFixed(2)}</div>
                    {p.approved && <div className="text-green-700">Approved</div>}
                    {p.meta?.type && <div>Type: <span className="capitalize">{p.meta.type}</span></div>}
                    {p.meta?.description && <div className="mt-1 max-w-xs">{p.meta.description}</div>}
                    <div className="text-xs text-gray-500 mt-1">{new Date(p.meta?.timestamp).toLocaleString()}</div>
                  </div>
                ) : (
                  <div className="text-sm">
                    <div className="font-semibold text-primary-navy mb-1">Social Indicator</div>
                    <a className="underline" href={p.meta?.link} target="_blank" rel="noopener noreferrer">{p.meta?.title || 'Open'}</a>
                    {p.meta?.summary && <div className="mt-1 max-w-xs text-gray-700">{p.meta.summary}</div>}
                    <div className="text-xs text-gray-500 mt-1">{new Date(p.meta?.published).toLocaleString()}</div>
                  </div>
                )}
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Legend */}
        <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur p-2 rounded border text-xs text-gray-700">
          <div className="font-medium text-primary-navy mb-1">Hotspot intensity</div>
          <div className="flex items-center gap-2">
            <span>Low</span>
            <div style={{ width: 120, height: 8, background: 'linear-gradient(90deg, #3b82f6, #f59e0b, #ef4444)' }} />
            <span>High</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HotspotMap

