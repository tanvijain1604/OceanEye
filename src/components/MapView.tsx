import React, { useEffect, useRef, useState, useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle, Polyline, Polygon } from 'react-leaflet'
import { RealTimeStreamsOverlay, PredictiveCurrentsOverlay } from './MapOverlays'
import L from 'leaflet'
import type { MapLocation } from '../utils/map'
import { createCustomIcon, getSeverityColor, mockShelters, mockIncidents, mockEvacuationRoutes, mockZones, getRouteColor, getZoneColor } from '../utils/map'
import { showNotification } from '../utils/notifications'
import { Badge } from './Badge'
import { useLocation } from '../providers/LocationProvider'
import { haversineDistanceKm } from '../utils/location'

// Fix for default markers in React-Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

interface MapViewProps {
  locations: MapLocation[]
  center?: [number, number]
  zoom?: number
  height?: string
  className?: string
  showControls?: boolean
  onLocationClick?: (location: MapLocation) => void
}

const MapController: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap()
  
  useEffect(() => {
    map.setView(center, zoom)
  }, [map, center, zoom])
  
  return null
}

export const MapView: React.FC<MapViewProps> = ({
  locations,
  center = [12.9716, 77.5946],
  zoom = 10,
  height = '400px',
  className = '',
  showControls = true,
  onLocationClick
}) => {
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null)
  const [filteredLocations, setFilteredLocations] = useState<MapLocation[]>(locations)
  const { coords, locateOnce: locateOnceGlobal } = useLocation()
  const [radiusKm, setRadiusKm] = useState<number>(5)
  const [filter, setFilter] = useState<string>('all')
  const [mapCenter, setMapCenter] = useState<[number, number]>(center)
  const [mapZoom, setMapZoom] = useState<number>(zoom)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [accuracy, setAccuracy] = useState<number | null>(null)
  const [tracking, setTracking] = useState<boolean>(false)
  const watchIdRef = useRef<number | null>(null)
  const userIconRef = useRef(L.divIcon({
    className: 'user-location-icon',
    html: `<div style="background-color:#2563eb;width:14px;height:14px;border:3px solid white;border-radius:50%;box-shadow:0 0 0 2px rgba(37,99,235,0.4)"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10]
  }))

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current)
      }
    }
  }, [])

  useEffect(() => {
    setMapCenter(center)
  }, [center])

  useEffect(() => {
    setMapZoom(zoom)
  }, [zoom])

  useEffect(() => {
    let base = locations
    if (filter !== 'all') {
      base = base.filter(loc => loc.type === filter)
    }
    if (coords) {
      const nearby = base.filter(loc => haversineDistanceKm({ lat: loc.lat, lng: loc.lng }, coords) <= radiusKm)
      base = nearby.length > 0 ? nearby : base
      setMapCenter([coords.lat, coords.lng])
    }
    setFilteredLocations(base)
  }, [locations, filter, coords, radiusKm])

  const handleLocationClick = (location: MapLocation) => {
    setSelectedLocation(location)
    onLocationClick?.(location)
  }

  const locateOnce = () => {
    if (!('geolocation' in navigator)) {
      showNotification('error', 'Geolocation unavailable', 'Your browser does not support geolocation.')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords
        setUserLocation({ lat: latitude, lng: longitude })
        setAccuracy(accuracy || null)
        setMapCenter([latitude, longitude])
        setMapZoom((z) => (z < 14 ? 14 : z))
      },
      (err) => {
        showNotification('error', 'Location error', err.message || 'Unable to fetch current location.')
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 10000 }
    )
  }

  
  const startTracking = () => {
    if (!('geolocation' in navigator)) {
      showNotification('error', 'Geolocation unavailable', 'Your browser does not support geolocation.')
      return
    }
    if (watchIdRef.current !== null) return
    setTracking(true)
    const id = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords
        setUserLocation({ lat: latitude, lng: longitude })
        setAccuracy(accuracy || null)
        setMapCenter([latitude, longitude])
      },
      (err) => {
        showNotification('error', 'Tracking error', err.message || 'Unable to track location.')
        setTracking(false)
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 }
    )
    watchIdRef.current = id as number
  }

  const stopTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
    setTracking(false)
  }

  const getLocationIcon = (location: MapLocation) => {
    const color = location.type === 'incident' 
      ? getSeverityColor((location as any).severity || 'medium')
      : '#1E90FF'
    
    return createCustomIcon(location.type, color)
  }

  const getLocationPopup = (location: MapLocation) => {
    switch (location.type) {
      case 'shelter':
        const shelter = location as any
        return (
          <div className="p-2">
            <h3 className="font-semibold text-primary-navy mb-2">{location.name}</h3>
            <div className="space-y-1 text-sm">
              <p><strong>Capacity:</strong> {shelter.capacity || 'N/A'}</p>
              <p><strong>Occupancy:</strong> {shelter.currentOccupancy || 'N/A'}</p>
              <p><strong>Contact:</strong> {shelter.contact || 'N/A'}</p>
              <p><strong>Address:</strong> {shelter.address || 'N/A'}</p>
              {shelter.facilities && (
                <div>
                  <strong>Facilities:</strong>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {shelter.facilities.map((facility: string, index: number) => (
                      <Badge key={index} variant="info" size="sm">
                        {facility}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )
      
      case 'incident':
        const incident = location as any
        return (
          <div className="p-2">
            <h3 className="font-semibold text-primary-navy mb-2">{location.name}</h3>
            <div className="space-y-1 text-sm">
              <p><strong>Type:</strong> {incident.category || 'N/A'}</p>
              <p><strong>Severity:</strong> 
                <Badge 
                  variant={getSeverityColor(incident.severity) === '#E53935' ? 'danger' : 'warning'} 
                  size="sm" 
                  className="ml-1"
                >
                  {incident.severity || 'N/A'}
                </Badge>
              </p>
              <p><strong>Status:</strong> {incident.status || 'N/A'}</p>
              <p><strong>Description:</strong> {incident.description || 'N/A'}</p>
              <p><strong>Reporter:</strong> {incident.reporter || 'N/A'}</p>
              <p><strong>Time:</strong> {new Date(incident.timestamp).toLocaleString()}</p>
            </div>
          </div>
        )
      
      default:
        return (
          <div className="p-2">
            <h3 className="font-semibold text-primary-navy">{location.name}</h3>
          </div>
        )
    }
  }

  const filterOptions = [
    { value: 'all', label: 'All Locations', icon: '📍' },
    { value: 'shelter', label: 'Shelters', icon: '🏠' },
    { value: 'incident', label: 'Incidents', icon: '⚠️' },
    { value: 'evacuation_route', label: 'Evacuation Routes', icon: '🚨' },
    { value: 'zone', label: 'Zones', icon: '🗺️' }
  ]

  // Build sample overlay data from current items so animations are visible immediately
  const streamNodes = useMemo(() => {
    const pts: Array<{ lat: number; lng: number; strength?: number }> = []
    filteredLocations.slice(0, 12).forEach((loc) => pts.push({ lat: loc.lat, lng: loc.lng }))
    mockZones.slice(0, 6).forEach((z) => {
      const p = z.data.polygon[0]
      if (p) pts.push({ lat: p[0], lng: p[1] })
    })
    if (pts.length === 0) pts.push({ lat: mapCenter[0], lng: mapCenter[1] })
    return pts
  }, [filteredLocations, mapCenter])

  const currentFields = useMemo(() => {
    const fields: Array<{ lat: number; lng: number; radiusKm?: number; intensity?: number; hue?: number }> = []
    mockZones.slice(0, 5).forEach((z, i) => {
      const poly = z.data.polygon as any
      if (poly && poly.length) {
        const [lat, lng] = poly[Math.floor(poly.length / 2)]
        fields.push({ lat, lng, radiusKm: 6 + (i % 3) * 4, intensity: 0.5 + (i % 2) * 0.2, hue: 180 - i * 12 })
      }
    })
    if (fields.length === 0) fields.push({ lat: mapCenter[0], lng: mapCenter[1], radiusKm: 10, intensity: 0.6, hue: 180 })
    return fields
  }, [mapCenter])

  return (
    <div className={`map-container ${className}`}>
      {showControls && (
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-wrap gap-2">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setFilter(option.value)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  filter === option.value
                    ? 'bg-primary-ocean text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="mr-1">{option.icon}</span>
                {option.label}
              </button>
            ))}
            <div className="ml-auto flex gap-2 items-center">
              <div className="flex items-center gap-1 text-sm">
                <span>Radius:</span>
                <select
                  value={radiusKm}
                  onChange={(e) => setRadiusKm(parseInt(e.target.value, 10))}
                  className="px-2 py-1 border rounded"
                >
                  <option value={2}>2km</option>
                  <option value={5}>5km</option>
                  <option value={10}>10km</option>
                  <option value={25}>25km</option>
                </select>
              </div>
              <button
                onClick={() => { locateOnce(); locateOnceGlobal(); }}
                className="px-3 py-1 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700"
              >
                Use My Location
              </button>
              <button
                onClick={tracking ? stopTracking : startTracking}
                className={`px-3 py-1 rounded-lg text-sm font-medium ${
                  tracking ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tracking ? 'Tracking On' : 'Start Tracking'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div style={{ height }} className="relative">
        <MapContainer
          center={center}
          zoom={zoom}
          style={{ height: '100%', width: '100%' }}
          className="z-0"
        >
          <MapController center={mapCenter} zoom={mapZoom} />
          
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* AI-inspired real-time streams and predictive overlays */}
          <PredictiveCurrentsOverlay fields={currentFields} opacity={0.18} />
          <RealTimeStreamsOverlay nodes={streamNodes} color="rgba(0,200,255,0.9)" maxLinksPerNode={2} />
          
          {userLocation && (
            <>
              <Marker
                position={[userLocation.lat, userLocation.lng]}
                icon={userIconRef.current}
              >
                <Popup>You are here</Popup>
              </Marker>
              {accuracy && accuracy > 0 && (
                <Circle
                  center={[userLocation.lat, userLocation.lng]}
                  radius={accuracy}
                  pathOptions={{ color: '#2563eb', fillColor: '#60a5fa', fillOpacity: 0.15 }}
                />
              )}
            </>
          )}
          
          {/* Zones as polygons */}
          {mockZones.map((zone) => (
            <Polygon
              key={`zone-${zone.data.id}`}
              positions={zone.data.polygon as any}
              pathOptions={{ color: getZoneColor(zone.data.level), fillColor: getZoneColor(zone.data.level), fillOpacity: 0.15 }}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-semibold text-primary-navy mb-1">{zone.data.name}</h3>
                  <p className="text-sm">Level: {zone.data.level}</p>
                </div>
              </Popup>
            </Polygon>
          ))}

          {/* Evacuation routes as polylines */}
          {mockEvacuationRoutes.map((route) => (
            <Polyline
              key={`route-${route.data.id}`}
              positions={route.data.path as any}
              pathOptions={{ color: getRouteColor(route.data.status), weight: 4, opacity: 0.9 }}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-semibold text-primary-navy mb-1">{route.data.name}</h3>
                  <p className="text-sm">Status: {route.data.status} | Capacity: {route.data.capacity}</p>
                </div>
              </Popup>
            </Polyline>
          ))}

          {/* Markers for filtered points (shelters/incidents/etc.) */}
          {filteredLocations.map((location) => (
            <Marker
              key={`${location.type}-${location.lat}-${location.lng}`}
              position={[location.lat, location.lng]}
              icon={getLocationIcon(location)}
              eventHandlers={{
                click: () => handleLocationClick(location)
              }}
            >
              <Popup>
                {getLocationPopup(location)}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
      
      {selectedLocation && (
        <div className="p-4 border-t border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-primary-navy">{selectedLocation.name}</h3>
              <p className="text-sm text-gray-600 capitalize">{selectedLocation.type.replace('_', ' ')}</p>
            </div>
            <button
              onClick={() => setSelectedLocation(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// Specialized map components for different use cases
export const ShelterMap: React.FC<{ shelters?: any[] }> = ({ shelters = mockShelters }) => {
  const shelterLocations: MapLocation[] = shelters.map(shelter => ({
    lat: shelter.lat,
    lng: shelter.lng,
    name: shelter.name,
    type: 'shelter' as const,
    data: shelter
  }))

  return (
    <MapView
      locations={shelterLocations}
      center={[12.9716, 77.5946]}
      zoom={11}
      height="500px"
      showControls={true}
    />
  )
}

export const IncidentMap: React.FC<{ incidents?: any[] }> = ({ incidents = mockIncidents }) => {
  const incidentLocations: MapLocation[] = incidents.map(incident => ({
    lat: incident.lat,
    lng: incident.lng,
    name: incident.name,
    type: 'incident' as const,
    data: incident
  }))

  return (
    <MapView
      locations={incidentLocations}
      center={[12.9716, 77.5946]}
      zoom={11}
      height="500px"
      showControls={true}
    />
  )
}


