import React, { useEffect, useMemo, useState } from 'react'
import { Card, CardContent } from './Card'
import { Button } from './Button'
import { Badge } from './Badge'
import { useLocation } from '../providers/LocationProvider'
import { mockShelters } from '../utils/map'
import { haversineDistanceKm } from '../utils/location'

export const NearestShelters: React.FC<{ radiusKm?: number; maxItems?: number }> = ({ radiusKm = 10, maxItems = 5 }) => {
  const { coords, locateOnce, locating, error } = useLocation()
  const [radius, setRadius] = useState<number>(radiusKm)

  const sorted = useMemo(() => {
    if (!coords) return []
    const withDistance = mockShelters.map((s) => ({
      ...s,
      distanceKm: haversineDistanceKm({ lat: s.lat, lng: s.lng }, coords)
    }))
    return withDistance.sort((a, b) => a.distanceKm - b.distanceKm)
  }, [coords])

  const nearby = useMemo(() => {
    if (!coords) return []
    return sorted.filter((s) => s.distanceKm <= radius).slice(0, maxItems)
  }, [coords, sorted, radius, maxItems])

  useEffect(() => {
    // Auto-ask once on mount if we don't have coords
    if (!coords) {
      // Do not auto-trigger locateOnce to avoid permission prompt on page load unless desired
    }
  }, [coords])

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-primary-navy">Nearest Shelters</h2>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-sm">
              <span>Radius:</span>
              <select value={radius} onChange={(e) => setRadius(parseInt(e.target.value, 10))} className="px-2 py-1 border rounded">
                <option value={2}>2km</option>
                <option value={5}>5km</option>
                <option value={10}>10km</option>
                <option value={25}>25km</option>
              </select>
            </div>
            <Button size="sm" variant="outline" onClick={locateOnce} disabled={locating}>Use My Location</Button>
          </div>
        </div>

        {!coords && (
          <div className="text-sm text-gray-600 mb-3">Provide your location to find nearby shelters.</div>
        )}
        {error && (
          <div className="text-sm text-red-600 mb-3">{error}</div>
        )}

        {coords && nearby.length === 0 && (
          <div className="text-sm text-gray-600">No shelters found within {radius} km. Increase the radius to see more.</div>
        )}

        <ul className="space-y-3">
          {nearby.map((shelter) => (
            <li key={shelter.id} className="p-3 border rounded-lg bg-white">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-semibold text-primary-navy">{shelter.name}</div>
                  <div className="text-xs text-gray-500">{shelter.address}</div>
                  <div className="text-xs text-gray-500">Distance: {shelter.distanceKm.toFixed(2)} km</div>
                </div>
                <Badge variant={shelter.currentOccupancy / shelter.capacity > 0.8 ? 'warning' : 'success'} size="sm">
                  {shelter.currentOccupancy}/{shelter.capacity}
                </Badge>
              </div>
              <div className="text-xs text-gray-600 mt-1">Contact: {shelter.contact}</div>
              {Array.isArray(shelter.facilities) && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {shelter.facilities.map((f: string, i: number) => (
                    <Badge key={i} variant="info" size="sm">{f}</Badge>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

export default NearestShelters
