import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'

export type GeoCoords = {
  lat: number
  lng: number
}

export type LocationState = {
  coords: GeoCoords | null
  accuracy: number | null
  permission: 'granted' | 'denied' | 'prompt' | 'unsupported'
  locating: boolean
  error: string | null
  // actions
  locateOnce: () => void
  startTracking: () => void
  stopTracking: () => void
}

const LocationContext = createContext<LocationState | undefined>(undefined)

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [coords, setCoords] = useState<GeoCoords | null>(null)
  const [accuracy, setAccuracy] = useState<number | null>(null)
  const [permission, setPermission] = useState<LocationState['permission']>('prompt')
  const [locating, setLocating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const watchIdRef = useRef<number | null>(null)

  // Detect support and permission
  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setPermission('unsupported')
      return
    }
    // Permissions API may not exist
    const anyNav: any = navigator
    if (anyNav.permissions?.query) {
      anyNav.permissions.query({ name: 'geolocation' as PermissionName }).then((status: any) => {
        setPermission((status.state as any) || 'prompt')
        status.onchange = () => setPermission((status.state as any) || 'prompt')
      }).catch(() => setPermission('prompt'))
    } else {
      setPermission('prompt')
    }
  }, [])

  const onPosition = useCallback((pos: GeolocationPosition) => {
    setError(null)
    setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude })
    setAccuracy(pos.coords.accuracy || null)
  }, [])

  const onError = useCallback((err: GeolocationPositionError) => {
    setError(err.message || 'Unable to fetch current location')
    setLocating(false)
  }, [])

  const locateOnce = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setPermission('unsupported')
      setError('Geolocation unsupported by this browser')
      return
    }
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onPosition(pos)
        setLocating(false)
      },
      (err) => {
        onError(err)
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 10000 }
    )
  }, [onError, onPosition])

  const startTracking = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setPermission('unsupported')
      setError('Geolocation unsupported by this browser')
      return
    }
    if (watchIdRef.current !== null) return
    setLocating(true)
    const id = navigator.geolocation.watchPosition(
      (pos) => {
        onPosition(pos)
      },
      (err) => {
        onError(err)
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 }
    )
    watchIdRef.current = id as number
  }, [onError, onPosition])

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
    setLocating(false)
  }, [])

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current)
      }
    }
  }, [])

  const value: LocationState = useMemo(() => ({
    coords,
    accuracy,
    permission,
    locating,
    error,
    locateOnce,
    startTracking,
    stopTracking,
  }), [coords, accuracy, permission, locating, error, locateOnce, startTracking, stopTracking])

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  )
}

export const useLocation = () => {
  const ctx = useContext(LocationContext)
  if (!ctx) throw new Error('useLocation must be used within a LocationProvider')
  return ctx
}
