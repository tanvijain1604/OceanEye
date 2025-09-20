import React, { useEffect, useMemo, useState } from 'react'
import { Card, CardContent } from './Card'
import { Badge } from './Badge'
import { Button } from './Button'
import { useLocation } from '../providers/LocationProvider'
import { mockResourceData } from '../utils/charts'
import { haversineDistanceKm } from '../utils/location'

interface Resource {
  name: string
  available: number
  allocated: number
  remaining: number
  location?: { lat: number; lng: number }
  distance?: number
}

function parseLatLngFromString(s?: string): { lat: number; lng: number } | null {
  if (!s) return null
  const m = s.match(/^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$/)
  if (!m) return null
  const lat = parseFloat(m[1])
  const lng = parseFloat(m[2])
  if (Number.isNaN(lat) || Number.isNaN(lng)) return null
  return { lat, lng }
}

export const NearestResources: React.FC<{ radiusKm?: number; maxItems?: number }> = ({ 
  radiusKm = 10, 
  maxItems = 5 
}) => {
  const { coords, locateOnce, locating } = useLocation()

  // User-entered center and radius
  const [centerInput, setCenterInput] = useState<string>('')
  const [center, setCenter] = useState<{ lat: number; lng: number } | null>(null)
  const [radius, setRadius] = useState<number>(radiusKm)
  const [inputError, setInputError] = useState<string | null>(null)

  // If user clicks "Use My Location" and coords later become available, adopt them as center
  useEffect(() => {
    if (coords && !center) {
      setCenter({ lat: coords.lat, lng: coords.lng })
      setInputError(null)
    }
  }, [coords, center])

  const onApplyCenter = () => {
    const parsed = parseLatLngFromString(centerInput)
    if (!parsed) {
      setInputError('Enter coordinates as "lat, lng" (e.g., 12.9716, 77.5946)')
      return
    }
    setCenter(parsed)
    setInputError(null)
  }

  // Mock resource locations (in a real app, these would come from an API with real coordinates)
  const resourcesWithLocations: Resource[] = useMemo(() => {
    const base = mockResourceData.map(resource => ({
      ...resource,
      // Randomized locations around Bengaluru for demo
      location: {
        lat: 12.9716 + (Math.random() - 0.5) * 0.1,
        lng: 77.5946 + (Math.random() - 0.5) * 0.1
      }
    }))

    const c = center || coords || null
    if (!c) return base

    return base.map(r => {
      const d = r.location ? haversineDistanceKm(c, r.location) : undefined
      return { ...r, distance: d }
    })
  }, [center, coords])

  const nearbyResources = useMemo(() => {
    const c = center || coords || null
    const list = c ? resourcesWithLocations.filter(r => (r.distance ?? Infinity) <= radius) : []
    return list
      .sort((a, b) => (a.distance || 0) - (b.distance || 0))
      .slice(0, maxItems)
  }, [center, coords, resourcesWithLocations, radius, maxItems])

  const getAvailabilityVariant = (available: number, allocated: number) => {
    const denom = available + allocated
    const percentage = denom > 0 ? available / denom : 0
    if (percentage > 0.7) return 'success'
    if (percentage > 0.3) return 'warning'
    return 'danger'
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-primary-navy">Resource Status</h3>
          {(center || coords) && (
            <span className="text-xs text-gray-500">Within {radius}km</span>
          )}
        </div>

        {/* Controls: user-entered location or current location */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={centerInput}
              onChange={(e) => setCenterInput(e.target.value)}
              placeholder="lat, lng (e.g., 12.9716, 77.5946)"
              className="min-w-0 flex-1 max-w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-ocean focus:border-transparent"
            />
          </div>
          <div className="grid grid-cols-2 gap-2 w-full">
            <Button size="sm" variant="outline" fullWidth className="overflow-hidden text-xs" onClick={onApplyCenter}>Apply</Button>
            <Button size="sm" variant="outline" fullWidth className="overflow-hidden text-xs" onClick={locateOnce} disabled={locating}>
              Use My Location
            </Button>
          </div>
          {inputError && <div className="text-xs text-red-600">{inputError}</div>}
          <div className="flex items-center gap-2 flex-wrap">
            <label className="text-sm text-gray-700">Radius (km):</label>
            <input
              type="number"
              min={1}
              max={500}
              value={radius}
              onChange={(e) => setRadius(Math.max(1, Math.min(500, Number(e.target.value) || radius)))}
              className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
            />
            {(center || coords) && (
              <span className="text-xs text-gray-500">
                Center: {(center || coords)!.lat.toFixed(3)}, {(center || coords)!.lng.toFixed(3)}
              </span>
            )}
          </div>
        </div>

        {!center && !coords && (
          <div className="text-sm text-gray-600 mb-3">Enter coordinates or use your current location to find nearby resources.</div>
        )}

        <div className="space-y-3">
          {nearbyResources.map((resource, index) => (
            <div key={`${resource.name}-${index}`} className="p-3 border border-gray-200 rounded-lg bg-white">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="font-medium text-primary-navy">{resource.name}</div>
                  {typeof resource.distance === 'number' && (
                    <div className="text-xs text-gray-500">
                      Distance: {resource.distance.toFixed(1)} km
                    </div>
                  )}
                </div>
                <Badge 
                  variant={getAvailabilityVariant(resource.available, resource.allocated)} 
                  size="sm"
                >
                  {resource.available} available
                </Badge>
              </div>
              
              <div className="space-y-1 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Available:</span>
                  <span className="font-medium">{resource.available}</span>
                </div>
                <div className="flex justify-between">
                  <span>Allocated:</span>
                  <span className="font-medium">{resource.allocated}</span>
                </div>
                <div className="flex justify-between">
                  <span>Remaining:</span>
                  <span className="font-medium">{resource.remaining}</span>
                </div>
              </div>

              {/* Availability bar */}
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      getAvailabilityVariant(resource.available, resource.allocated) === 'success'
                        ? 'bg-green-500'
                        : getAvailabilityVariant(resource.available, resource.allocated) === 'warning'
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}
                    style={{
                      width: `${(resource.available / (resource.available + resource.allocated)) * 100}%`
                    }}
                  />
                </div>
              </div>
            </div>
          ))}

          {nearbyResources.length === 0 && (center || coords) && (
            <div className="text-center text-gray-500 py-4">
              <span className="text-2xl mb-2 block">📦</span>
              <p className="text-sm">No resources found in the area</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default NearestResources
