import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '../../components/Button'
import { Badge } from '../../components/Badge'
import { useReports } from '../../providers/ReportsProvider'

export type ReportItem = {
  id: string
  type: string
  description: string
  location: string
  status: 'pending' | 'approved' | 'rejected'
  priority: 'low' | 'medium' | 'high' | 'critical'
  reporterId: string
  reporterName?: string
  timestamp: string
  lat?: number
  lng?: number
  photoDataUrl?: string
  videoDataUrl?: string
  commentsText?: string
}

const API_BASE_KEY = 'oceaneye-api-base'
function getApiBase(): string {
  try {
    return localStorage.getItem(API_BASE_KEY) || 'http://localhost:4000'
  } catch {
    return 'http://localhost:4000'
  }
}

async function withTimeout<T>(p: Promise<T>, ms = 5000): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('timeout')), ms)
    p.then((v) => { clearTimeout(timer); resolve(v) })
     .catch((e) => { clearTimeout(timer); reject(e) })
  })
}

async function loadFromServer(signal?: AbortSignal): Promise<ReportItem[]> {
  const base = getApiBase()
  const res = await withTimeout(fetch(`${base}/api/reports`, { method: 'GET', signal }), 5000)
  const body = await res.json().catch(() => ({}))
  if (!res.ok || !body?.ok || !Array.isArray(body.items)) throw new Error('failed')
  return body.items as ReportItem[]
}

export const LiveReportsFeed: React.FC = () => {
  const { reports: providerReports } = useReports()
  const [items, setItems] = useState<ReportItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [auto, setAuto] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
  const [q, setQ] = useState('')
  const [lastUpdated, setLastUpdated] = useState<number | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const refresh = useCallback(async () => {
    abortRef.current?.abort()
    const ac = new AbortController()
    abortRef.current = ac
    setLoading(true)
    setError(null)
    try {
      const serverItems = await loadFromServer(ac.signal)
      setItems(serverItems)
      setLastUpdated(Date.now())
    } catch (_e) {
      // Fallback to provider cache if server unreachable
      setItems(providerReports as any)
      setError(null)
      setLastUpdated(Date.now())
    } finally {
      setLoading(false)
    }
  }, [providerReports])

  useEffect(() => {
    // initial load
    refresh()
    return () => abortRef.current?.abort()
  }, [refresh])

  useEffect(() => {
    if (!auto) return
    const id = setInterval(refresh, 10000)
    return () => clearInterval(id)
  }, [auto, refresh])

  const visible = useMemo(() => {
    let arr = [...items]
    // sort desc by timestamp
    arr.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    if (filter !== 'all') arr = arr.filter(r => r.status === filter)
    if (q.trim()) {
      const qq = q.trim().toLowerCase()
      arr = arr.filter(r => (
        r.type?.toLowerCase().includes(qq) ||
        r.description?.toLowerCase().includes(qq) ||
        r.location?.toLowerCase().includes(qq)
      ))
    }
    return arr
  }, [items, filter, q])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-center">
        <Button variant="outline" onClick={refresh} disabled={loading}>
          {loading ? 'Refreshing…' : 'Refresh'}
        </Button>
        <label className="text-sm flex items-center gap-2">
          <input type="checkbox" checked={auto} onChange={(e) => setAuto(e.target.checked)} />
          Auto-refresh every 10s
        </label>
        <label className="text-sm flex items-center gap-2">
          Status:
          <select value={filter} onChange={(e) => setFilter(e.target.value as any)} className="px-2 py-1 border rounded">
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </label>
        <input
          type="text"
          placeholder="Search type/description/location…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="px-3 py-2 border rounded w-full md:w-80"
        />
        <div className="ml-auto text-xs text-gray-500">
          {lastUpdated ? `Last updated: ${new Date(lastUpdated).toLocaleTimeString()}` : 'Never updated'}
        </div>
      </div>

      {error && (
        <div className="text-sm text-red-600">{error}</div>
      )}

      {visible.length === 0 ? (
        <div className="text-sm text-gray-600">No reports to show.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {visible.map((r) => (
            <div key={r.id} className="p-4 border border-gray-200 rounded-lg bg-white">
              <div className="flex items-center justify-between mb-1">
                <div className="font-semibold capitalize text-primary-navy">{r.type}</div>
                <div className="flex items-center gap-2">
                  <Badge variant={r.status === 'approved' ? 'success' : r.status === 'rejected' ? 'danger' : 'warning'} size="sm">
                    {r.status}
                  </Badge>
                  <Badge variant={r.priority === 'critical' ? 'danger' : r.priority === 'high' ? 'warning' : 'info'} size="sm">
                    {r.priority}
                  </Badge>
                </div>
              </div>
              <div className="text-xs text-gray-500 mb-2">{new Date(r.timestamp).toLocaleString()}</div>
              <div className="text-sm text-gray-700 mb-2 line-clamp-3">{r.description}</div>
              {typeof r.lat === 'number' && typeof r.lng === 'number' && (
                <div className="text-xs text-gray-600">Coords: {r.lat.toFixed(3)}, {r.lng.toFixed(3)}</div>
              )}
              {r.location && (
                <div className="text-xs text-gray-600">Location: {r.location}</div>
              )}
              {r.photoDataUrl && (
                <img src={r.photoDataUrl} alt="report" className="mt-2 max-h-40 rounded" />
              )}
              {r.videoDataUrl && (
                <video controls className="mt-2 w-full max-h-48 rounded">
                  <source src={r.videoDataUrl} />
                </video>
              )}
              {r.commentsText && (
                <div className="mt-2 text-xs text-gray-700 whitespace-pre-wrap">Comments: {r.commentsText}</div>
              )}
              <div className="text-xs text-gray-500 mt-2">Reporter: {r.reporterName || r.reporterId}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default LiveReportsFeed
