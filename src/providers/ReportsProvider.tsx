import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { showNotification } from '../utils/notifications'

export type ReportStatus = 'pending' | 'approved' | 'rejected'
export type Priority = 'low' | 'medium' | 'high' | 'critical'
export type Report = {
  id: string
  type: string
  description: string
  location: string
  photoDataUrl?: string
  videoDataUrl?: string
  commentsText?: string
  status: ReportStatus
  priority: Priority
  reporterId: string
  reporterName?: string
  timestamp: string
  lat?: number
  lng?: number
}

export type NewReport = Omit<Report, 'id' | 'status' | 'timestamp' | 'reporterId' | 'priority'> & {
  reporterId?: string
}

type ReportsContextType = {
  reports: Report[]
  submitReport: (data: NewReport) => Report
  updateStatus: (id: string, status: ReportStatus) => void
  updatePriority: (id: string, priority: Priority) => void
  clearAll: () => void
}

const KEY = 'oceaneye-reports'

const ReportsContext = createContext<ReportsContextType | undefined>(undefined)

function getUserId(): string {
  let id = localStorage.getItem('oceaneye-user-id')
  if (!id) {
    id = Math.random().toString(36).slice(2) + Date.now().toString(36)
    localStorage.setItem('oceaneye-user-id', id)
  }
  return id
}

// Backend helpers (kept local to this provider to avoid coupling)
const API_BASE_KEY = 'oceaneye-api-base'
function getApiBase(): string {
  try {
    return localStorage.getItem(API_BASE_KEY) || 'http://localhost:4000'
  } catch {
    return 'http://localhost:4000'
  }
}

async function withTimeout<T>(p: Promise<T>, ms = 3000): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('timeout')), ms)
    p.then(v => { clearTimeout(timer); resolve(v) })
     .catch(err => { clearTimeout(timer); reject(err) })
  })
}

async function pingBackend(): Promise<boolean> {
  try {
    const base = getApiBase()
    const res = await withTimeout(fetch(`${base}/api/health`, { method: 'GET' }), 1500)
    return res.ok
  } catch {
    return false
  }
}

export const ReportsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [reports, setReports] = useState<Report[]>([])

  // Load from localStorage once
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) setReports(parsed)
      }
    } catch {}
  }, [])

  // Try to load from backend if available (overrides local cache)
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const canUse = await pingBackend()
        if (!canUse) return
        const base = getApiBase()
        const res = await withTimeout(fetch(`${base}/api/reports`, { method: 'GET' }), 4000)
        const body = await res.json().catch(() => ({}))
        if (!cancelled && res.ok && body?.ok && Array.isArray(body.items)) {
          setReports(body.items)
        }
      } catch {}
    })()
    return () => { cancelled = true }
  }, [])

  // Persist to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(reports))
    } catch {}
  }, [reports])

  const submitReport = useCallback((data: NewReport): Report => {
    const id = 'r_' + Math.random().toString(36).slice(2)
    const now = new Date().toISOString()
    const reporterId = data.reporterId || getUserId()
    const report: Report = {
      id,
      type: data.type,
      description: data.description,
      location: data.location,
      photoDataUrl: data.photoDataUrl,
      videoDataUrl: data.videoDataUrl,
      commentsText: data.commentsText,
      status: 'pending',
      priority: 'medium',
      reporterId,
      reporterName: data.reporterName,
      timestamp: now,
      lat: data.lat,
      lng: data.lng,
    }
    // Optimistic local update for instant UX
    setReports(prev => [report, ...prev])

    // Background sync with backend when available
    ;(async () => {
      try {
        const canUse = await pingBackend()
        if (!canUse) return
        const base = getApiBase()
        await withTimeout(fetch(`${base}/api/reports`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: report.type,
            description: report.description,
            location: report.location,
            photoDataUrl: report.photoDataUrl,
            videoDataUrl: report.videoDataUrl,
            commentsText: report.commentsText,
            reporterId: report.reporterId,
            reporterName: report.reporterName,
            lat: report.lat,
            lng: report.lng,
          })
        }), 5000)
      } catch {}
    })()

    return report
  }, [])

  const updateStatus = useCallback((id: string, status: ReportStatus) => {
    setReports(prev => {
      const prevReport = prev.find(r => r.id === id)
      const updated = prev.map(r => r.id === id ? { ...r, status } : r)

      // Show popup when a report transitions to approved
      if (status === 'approved' && prevReport && prevReport.status !== 'approved') {
        const reporter = prevReport.reporterName || prevReport.reporterId || 'Reporter'
        showNotification(
          'success',
          'Report Approved',
          `Report (${prevReport.type}) by ${reporter} has been approved.`
        )
      }

      return updated
    })
  }, [])

  const updatePriority = useCallback((id: string, priority: Priority) => {
    setReports(prev => prev.map(r => r.id === id ? { ...r, priority } : r))
  }, [])

  const clearAll = useCallback(() => setReports([]), [])

  const value = useMemo(() => ({ reports, submitReport, updateStatus, updatePriority, clearAll }), [reports, submitReport, updateStatus, updatePriority, clearAll])

  return (
    <ReportsContext.Provider value={value}>
      {children}
    </ReportsContext.Provider>
  )
}

export function useReports() {
  const ctx = useContext(ReportsContext)
  if (!ctx) throw new Error('useReports must be used within ReportsProvider')
  return ctx
}
